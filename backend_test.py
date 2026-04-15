#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class CafePOSAPITester:
    def __init__(self, base_url="https://c4fd2bfb-f186-46eb-964f-50d9bb38060a.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, expected_data_checks=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json() if response.text else {}
            except:
                response_data = {"raw_response": response.text}

            # Additional data validation checks
            if success and expected_data_checks:
                for check_name, check_func in expected_data_checks.items():
                    if not check_func(response_data):
                        success = False
                        print(f"❌ Failed data validation: {check_name}")
                        break

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response_data:
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": response_data
            })

            return success, response_data

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200,
            expected_data_checks={
                "has_status": lambda data: data.get("status") == "ok"
            }
        )

    def test_get_menu_items(self):
        """Test getting all menu items"""
        success, data = self.run_test(
            "Get Menu Items",
            "GET",
            "api/menu-items",
            200,
            expected_data_checks={
                "is_list": lambda data: isinstance(data, list),
                "has_18_items": lambda data: len(data) == 18,
                "items_have_required_fields": lambda data: all(
                    'id' in item and 'name' in item and 'price' in item and 'category' in item 
                    for item in data
                )
            }
        )
        return success, data

    def test_get_categories(self):
        """Test getting categories"""
        return self.run_test(
            "Get Categories",
            "GET",
            "api/menu-items/categories",
            200,
            expected_data_checks={
                "is_list": lambda data: isinstance(data, list),
                "has_5_categories": lambda data: len(data) == 5,
                "has_expected_categories": lambda data: set(data) == {"Coffee", "Pastry", "Tea", "Food", "Drinks"}
            }
        )

    def test_create_menu_item(self):
        """Test creating a new menu item"""
        test_item = {
            "name": "Test Latte",
            "price": 4.75,
            "category": "Coffee",
            "image": "https://example.com/test.jpg"
        }
        
        success, data = self.run_test(
            "Create Menu Item",
            "POST",
            "api/menu-items",
            200,
            data=test_item,
            expected_data_checks={
                "has_id": lambda data: 'id' in data,
                "correct_name": lambda data: data.get('name') == test_item['name'],
                "correct_price": lambda data: data.get('price') == test_item['price']
            }
        )
        return success, data

    def test_update_menu_item(self, item_id):
        """Test updating a menu item"""
        update_data = {
            "name": "Updated Test Latte",
            "price": 5.25
        }
        
        return self.run_test(
            "Update Menu Item",
            "PUT",
            f"api/menu-items/{item_id}",
            200,
            data=update_data,
            expected_data_checks={
                "correct_updated_name": lambda data: data.get('name') == update_data['name'],
                "correct_updated_price": lambda data: data.get('price') == update_data['price']
            }
        )

    def test_delete_menu_item(self, item_id):
        """Test deleting a menu item"""
        return self.run_test(
            "Delete Menu Item",
            "DELETE",
            f"api/menu-items/{item_id}",
            200,
            expected_data_checks={
                "deleted_flag": lambda data: data.get('deleted') == True
            }
        )

    def test_create_bill(self):
        """Test creating a bill"""
        test_bill = {
            "items": [
                {
                    "menu_item_id": "test_id_1",
                    "name": "Espresso",
                    "price": 3.50,
                    "quantity": 2
                },
                {
                    "menu_item_id": "test_id_2", 
                    "name": "Croissant",
                    "price": 3.50,
                    "quantity": 1
                }
            ],
            "subtotal": 10.50,
            "tax_rate": 10,
            "tax_amount": 1.05,
            "discount_percent": 0,
            "discount_amount": 0.00,
            "total": 11.55,
            "customer_name": "Test Customer"
        }
        
        success, data = self.run_test(
            "Create Bill",
            "POST",
            "api/bills",
            200,
            data=test_bill,
            expected_data_checks={
                "has_id": lambda data: 'id' in data,
                "has_bill_number": lambda data: 'bill_number' in data and data['bill_number'].startswith('CAFE-'),
                "correct_total": lambda data: data.get('total') == test_bill['total'],
                "has_created_at": lambda data: 'created_at' in data
            }
        )
        return success, data

    def test_get_bills(self):
        """Test getting all bills"""
        return self.run_test(
            "Get Bills",
            "GET",
            "api/bills",
            200,
            expected_data_checks={
                "is_list": lambda data: isinstance(data, list)
            }
        )

    def test_get_bill_by_id(self, bill_id):
        """Test getting a specific bill"""
        return self.run_test(
            "Get Bill by ID",
            "GET",
            f"api/bills/{bill_id}",
            200,
            expected_data_checks={
                "has_id": lambda data: 'id' in data,
                "correct_id": lambda data: data.get('id') == bill_id
            }
        )

def main():
    print("🚀 Starting Cafe POS API Tests...")
    print("=" * 50)
    
    tester = CafePOSAPITester()
    
    # Test 1: Health Check
    health_success, _ = tester.test_health_check()
    if not health_success:
        print("❌ Health check failed, stopping tests")
        return 1

    # Test 2: Get Menu Items (should have 18 pre-seeded items)
    menu_success, menu_items = tester.test_get_menu_items()
    
    # Test 3: Get Categories (should have 5 categories)
    categories_success, _ = tester.test_get_categories()
    
    # Test 4: Create Menu Item
    create_success, created_item = tester.test_create_menu_item()
    created_item_id = created_item.get('id') if create_success else None
    
    # Test 5: Update Menu Item (if create was successful)
    update_success = True
    if created_item_id:
        update_success, _ = tester.test_update_menu_item(created_item_id)
    
    # Test 6: Create Bill
    bill_success, created_bill = tester.test_create_bill()
    created_bill_id = created_bill.get('id') if bill_success else None
    
    # Test 7: Get Bills
    bills_success, _ = tester.test_get_bills()
    
    # Test 8: Get Bill by ID (if create was successful)
    get_bill_success = True
    if created_bill_id:
        get_bill_success, _ = tester.test_get_bill_by_id(created_bill_id)
    
    # Test 9: Delete Menu Item (cleanup)
    delete_success = True
    if created_item_id:
        delete_success, _ = tester.test_delete_menu_item(created_item_id)

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        failed_tests = [t for t in tester.test_results if not t['success']]
        print("\nFailed tests:")
        for test in failed_tests:
            error_msg = test.get('error', f'Status {test.get("actual_status", "unknown")}')
            print(f"  - {test['name']}: {error_msg}")
        return 1

if __name__ == "__main__":
    sys.exit(main())