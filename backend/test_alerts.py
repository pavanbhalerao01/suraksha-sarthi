"""
Test script for alert functionality
Tests both rescue team and citizen alerts
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_rescue_team_alert():
    """Test sending rescue team alert"""
    print("Testing Rescue Team Alert...")
    
    payload = {
        "disaster_id": "FL-MUM-TEST-001",
        "disaster_type": "flood",
        "title": "Test Flood Alert - Mumbai",
        "description": "This is a test flood alert for Mumbai",
        "severity": "HIGH",
        "location": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "affected_area": "50 sq km",
        "affected_people": "1000 people",
        "sent_by": "NDRF_ADMIN"
    }
    
    response = requests.post(f"{BASE_URL}/api/alerts/rescue-team", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Rescue Team Alert Test PASSED")
        print(f"   Teams notified: {data['data']['teams_notified']}")
        print(f"   Message: {data['data']['message']}")
        return True
    else:
        print(f"❌ Rescue Team Alert Test FAILED")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_citizen_alert():
    """Test sending citizen alert"""
    print("\nTesting Citizen Alert...")
    
    payload = {
        "disaster_id": "FL-PUNE-TEST-001",
        "disaster_type": "fire",
        "title": "Test Fire Alert - Pune",
        "description": "This is a test fire alert for Pune",
        "severity": "CRITICAL",
        "location": "Pune",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "affected_area": "10 sq km",
        "affected_people": "500 people",
        "safety_instructions": "Evacuate immediately. Stay low to avoid smoke.",
        "sent_by": "NDRF_ADMIN"
    }
    
    response = requests.post(f"{BASE_URL}/api/alerts/citizen", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Citizen Alert Test PASSED")
        print(f"   Citizens notified: {data['data']['citizens_notified']:,}")
        print(f"   Message: {data['data']['message']}")
        return True
    else:
        print(f"❌ Citizen Alert Test FAILED")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_alert_history():
    """Test getting alert history"""
    print("\nTesting Alert History...")
    
    response = requests.get(f"{BASE_URL}/api/alerts/history")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Alert History Test PASSED")
        print(f"   Total alerts: {data['total']}")
        if data['total'] > 0:
            print(f"   Latest alert: {data['alerts'][0]['title']}")
        return True
    else:
        print(f"❌ Alert History Test FAILED")
        print(f"   Status Code: {response.status_code}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ALERT SYSTEM TEST SUITE")
    print("=" * 60)
    
    try:
        # Test health check
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            print("✅ Backend server is running\n")
        else:
            print("❌ Backend server is not responding")
            exit(1)
        
        # Run tests
        results = []
        results.append(test_rescue_team_alert())
        results.append(test_citizen_alert())
        results.append(test_alert_history())
        
        # Summary
        print("\n" + "=" * 60)
        print(f"TESTS PASSED: {sum(results)}/{len(results)}")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("   Please ensure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")
