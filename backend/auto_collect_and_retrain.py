"""
Automated data collection and retraining scheduler
Run this script to enable continuous learning for heatwave prediction
"""

import schedule
import time
from datetime import datetime
import random
from continuous_learning_heatwave import ContinuousLearningSystem

# Define monitored locations
MONITORED_LOCATIONS = [
    {'name': 'Pune', 'lat': 18.5204, 'lon': 73.8567},
    {'name': 'Mumbai', 'lat': 19.0760, 'lon': 72.8777},
    {'name': 'Bangalore', 'lat': 12.9716, 'lon': 77.5946},
    {'name': 'Chennai', 'lat': 13.0827, 'lon': 80.2707},
    {'name': 'Kolkata', 'lat': 22.5726, 'lon': 88.3639},
    {'name': 'Hyderabad', 'lat': 17.3850, 'lon': 78.4867},
    {'name': 'Delhi', 'lat': 28.6139, 'lon': 77.2090},
    {'name': 'Ahmedabad', 'lat': 23.0225, 'lon': 72.5714}
]

def generate_realistic_weather(location_name):
    """
    Generate realistic weather data for demonstration
    In production, replace this with actual API calls
    """
    # Base temperatures by location (seasonal variations can be added)
    base_temps = {
        'Delhi': random.randint(28, 45),
        'Mumbai': random.randint(26, 38),
        'Bangalore': random.randint(24, 36),
        'Chennai': random.randint(28, 40),
        'Kolkata': random.randint(26, 40),
        'Hyderabad': random.randint(26, 42),
        'Pune': random.randint(24, 40),
        'Ahmedabad': random.randint(28, 44)
    }
    
    max_temp = base_temps.get(location_name, random.randint(28, 42))
    min_temp = max_temp - random.randint(8, 15)
    
    weather = {
        'date': datetime.now().isoformat(),
        'max_temperature': max_temp,
        'min_temperature': min_temp,
        'humidity': random.randint(20, 85),
        'max_humidity': random.randint(50, 95),
        'min_humidity': random.randint(15, 45),
        'wind_speed': random.randint(5, 30),
        'pressure': random.randint(995, 1020),
        'rainfall': random.uniform(0, 15) if random.random() > 0.7 else 0,
        'solar_radiation': random.randint(400, 950),
        'uv_index': random.randint(3, 11),
        'cloud_cover': random.randint(0, 100),
        'dew_point': random.randint(15, 32),
        'visibility': random.randint(5, 10),
        'precipitation_probability': random.randint(0, 100)
    }
    
    return weather

def collect_current_weather():
    """Fetch and store current weather for all monitored locations"""
    print(f"\n{'='*60}")
    print(f"📡 [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Collecting weather data...")
    print(f"{'='*60}")
    
    system = ContinuousLearningSystem()
    success_count = 0
    error_count = 0
    
    for location in MONITORED_LOCATIONS:
        try:
            # Generate realistic weather data
            # TODO: Replace with actual API call: fetch_weather_data(location['lat'], location['lon'])
            weather = generate_realistic_weather(location['name'])
            
            if weather:
                # Add location info
                weather['latitude'] = location['lat']
                weather['longitude'] = location['lon']
                
                # Collect
                if system.collect_weather_data(weather, location['name']):
                    success_count += 1
                else:
                    error_count += 1
            else:
                print(f"⚠️ No weather data for {location['name']}")
                error_count += 1
            
        except Exception as e:
            print(f"❌ Error collecting data for {location['name']}: {e}")
            error_count += 1
    
    print(f"\n📊 Collection Summary:")
    print(f"   ✅ Success: {success_count}/{len(MONITORED_LOCATIONS)}")
    print(f"   ❌ Errors: {error_count}/{len(MONITORED_LOCATIONS)}")
    print(f"{'='*60}\n")

def check_and_retrain():
    """Check if retraining is needed and execute"""
    print(f"\n{'='*60}")
    print(f"🔍 [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking if retraining needed...")
    print(f"{'='*60}")
    
    system = ContinuousLearningSystem()
    
    if system.should_retrain():
        print("🔄 Triggering model retraining...")
        result = system.retrain_model()
        
        if result['status'] == 'success':
            print("\n🎉 Model retrained successfully!")
            print(f"   New accuracy: {result['metrics']['accuracy']:.2%}")
            print(f"   Model version: {result['metadata']['model_version']}")
        else:
            print(f"\n⚠️ Retraining {result['status']}: {result.get('reason', 'unknown')}")
    else:
        print("⏭️ No retraining needed yet")
    
    print(f"{'='*60}\n")

def main():
    """Main scheduler function"""
    print("="*60)
    print("🌡️  AUTOMATED HEATWAVE PREDICTION - CONTINUOUS LEARNING")
    print("="*60)
    print("\n⚙️ Setting up automated tasks...")
    
    # Schedule tasks
    # Collect weather data every 6 hours
    schedule.every(6).hours.do(collect_current_weather)
    
    # Check for retraining every day at 2 AM
    schedule.every().day.at("02:00").do(check_and_retrain)
    
    print("\n✅ Scheduler configured:")
    print("   📡 Weather collection: Every 6 hours")
    print("   🔄 Retrain check: Daily at 2:00 AM")
    print(f"\n🚀 Starting automated system at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("   Press Ctrl+C to stop\n")
    
    # Run collection immediately once
    try:
        collect_current_weather()
    except Exception as e:
        print(f"❌ Initial collection error: {e}")
    
    # Keep running
    print("⏰ Scheduler is now running...\n")
    
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping automated system...")
            print(f"   Stopped at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print("   Goodbye! 👋\n")
            break
        except Exception as e:
            print(f"\n❌ Scheduler error: {e}")
            print("   Retrying in 5 minutes...\n")
            time.sleep(300)

if __name__ == "__main__":
    main()
