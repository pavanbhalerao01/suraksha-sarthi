"""
Test script for continuous learning system
Demonstrates data collection and retraining workflow
"""

from continuous_learning_heatwave import ContinuousLearningSystem
from datetime import datetime
import random

def test_data_collection():
    """Test collecting sample weather data"""
    print("="*60)
    print("TEST 1: Data Collection")
    print("="*60)
    
    system = ContinuousLearningSystem()
    
    # Simulate weather data for different conditions
    test_locations = [
        {
            'name': 'Delhi_Heatwave',
            'data': {
                'date': datetime.now().isoformat(),
                'latitude': 28.6139,
                'longitude': 77.2090,
                'max_temperature': 46,  # Heatwave condition
                'min_temperature': 32,
                'humidity': 28,
                'max_humidity': 35,
                'min_humidity': 22,
                'wind_speed': 8,
                'pressure': 1006,
                'rainfall': 0,
                'solar_radiation': 920,
                'uv_index': 11,
                'cloud_cover': 5,
                'dew_point': 18,
                'visibility': 6,
                'precipitation_probability': 0
            }
        },
        {
            'name': 'Mumbai_Normal',
            'data': {
                'date': datetime.now().isoformat(),
                'latitude': 19.0760,
                'longitude': 72.8777,
                'max_temperature': 32,  # Normal condition
                'min_temperature': 26,
                'humidity': 75,
                'max_humidity': 85,
                'min_humidity': 65,
                'wind_speed': 15,
                'pressure': 1012,
                'rainfall': 2.5,
                'solar_radiation': 650,
                'uv_index': 7,
                'cloud_cover': 40,
                'dew_point': 24,
                'visibility': 10,
                'precipitation_probability': 30
            }
        },
        {
            'name': 'Bangalore_Moderate',
            'data': {
                'date': datetime.now().isoformat(),
                'latitude': 12.9716,
                'longitude': 77.5946,
                'max_temperature': 38,  # Moderate heat
                'min_temperature': 28,
                'humidity': 45,
                'max_humidity': 55,
                'min_humidity': 35,
                'wind_speed': 10,
                'pressure': 1010,
                'rainfall': 0,
                'solar_radiation': 780,
                'uv_index': 9,
                'cloud_cover': 20,
                'dew_point': 22,
                'visibility': 9,
                'precipitation_probability': 10
            }
        }
    ]
    
    print("\n📊 Collecting weather data for 3 test locations...\n")
    
    for location in test_locations:
        success = system.collect_weather_data(location['data'], location['name'])
        if success:
            print(f"   ✓ {location['name']}: Max Temp = {location['data']['max_temperature']}°C")
        else:
            print(f"   ✗ {location['name']}: Failed")
    
    print("\n✅ Data collection test complete!\n")

def test_validation():
    """Test data validation"""
    print("="*60)
    print("TEST 2: Data Validation")
    print("="*60)
    
    system = ContinuousLearningSystem()
    
    print("\n📊 Validating collected data...\n")
    
    valid_df, invalid_count = system.validate_new_data()
    
    if valid_df is not None:
        print(f"\n✅ Validation complete!")
        print(f"   Valid samples: {len(valid_df)}")
        print(f"   Invalid samples: {invalid_count}")
        print(f"   Validation rate: {len(valid_df)/(len(valid_df)+invalid_count)*100:.1f}%")
    else:
        print("\n⚠️ No data to validate or validation failed")
    
    print()

def test_retrain_check():
    """Test retraining decision logic"""
    print("="*60)
    print("TEST 3: Retrain Decision Check")
    print("="*60)
    
    system = ContinuousLearningSystem()
    
    print("\n🔍 Checking if retraining should be triggered...\n")
    
    should_retrain = system.should_retrain()
    
    if should_retrain:
        print("✅ Retraining is needed")
        print("   Reason: Either enough time passed or sufficient new data")
    else:
        print("⏭️ Retraining not needed yet")
        print("   Reason: Not enough time or data since last training")
    
    print()

def test_bulk_collection():
    """Test collecting multiple samples"""
    print("="*60)
    print("TEST 4: Bulk Data Collection (Simulating 1 week)")
    print("="*60)
    
    system = ContinuousLearningSystem()
    
    print("\n📡 Simulating weather data collection over 7 days...")
    print("   (4 samples per day = 28 total samples)\n")
    
    collected = 0
    
    for day in range(7):
        for sample in range(4):
            # Generate random weather data
            temp_base = random.randint(30, 48)
            
            weather = {
                'date': datetime.now().isoformat(),
                'latitude': random.choice([28.6139, 19.0760, 12.9716]),
                'longitude': random.choice([77.2090, 72.8777, 77.5946]),
                'max_temperature': temp_base,
                'min_temperature': temp_base - random.randint(5, 12),
                'humidity': random.randint(20, 80),
                'max_humidity': random.randint(50, 95),
                'min_humidity': random.randint(15, 45),
                'wind_speed': random.randint(5, 25),
                'pressure': random.randint(995, 1020),
                'rainfall': random.uniform(0, 10) if random.random() > 0.7 else 0,
                'solar_radiation': random.randint(400, 950),
                'uv_index': random.randint(3, 11),
                'cloud_cover': random.randint(0, 100),
                'dew_point': random.randint(15, 30),
                'visibility': random.randint(5, 10),
                'precipitation_probability': random.randint(0, 100)
            }
            
            if system.collect_weather_data(weather, f'Test_Location_Day{day+1}'):
                collected += 1
    
    print(f"\n✅ Bulk collection complete!")
    print(f"   Successfully collected: {collected} samples")
    print(f"   These samples are now stored in: {system.new_data_path}\n")

def test_full_workflow():
    """Test complete workflow: collect → validate → check retrain"""
    print("\n" + "="*60)
    print("FULL WORKFLOW TEST")
    print("="*60 + "\n")
    
    # Step 1: Collection
    test_data_collection()
    
    # Step 2: More collection
    test_bulk_collection()
    
    # Step 3: Validation
    test_validation()
    
    # Step 4: Retrain check
    test_retrain_check()
    
    print("="*60)
    print("✅ ALL TESTS COMPLETED!")
    print("="*60)
    print("\n💡 Next Steps:")
    print("   1. To manually trigger retraining:")
    print("      python continuous_learning_heatwave.py --mode retrain")
    print("\n   2. To start automated collection:")
    print("      python auto_collect_and_retrain.py")
    print("\n   3. To collect single data point:")
    print("      python continuous_learning_heatwave.py --mode collect --location YourCity")
    print()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        test_name = sys.argv[1]
        
        if test_name == 'collect':
            test_data_collection()
        elif test_name == 'validate':
            test_validation()
        elif test_name == 'check':
            test_retrain_check()
        elif test_name == 'bulk':
            test_bulk_collection()
        else:
            print(f"Unknown test: {test_name}")
            print("Available tests: collect, validate, check, bulk, full")
    else:
        # Run all tests
        test_full_workflow()
