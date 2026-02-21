# 🌡️ Continuous Learning System for Heatwave Prediction

This system automatically collects weather data, validates it, and periodically retrains the ML model to improve accuracy over time.

## 📁 Files

- **`continuous_learning_heatwave.py`** - Core continuous learning system
- **`auto_collect_and_retrain.py`** - Automated scheduler for data collection & retraining
- **`test_continuous_learning.py`** - Test suite to verify functionality

## 🚀 Quick Start

### 1. Test the System

```powershell
# Run all tests
python test_continuous_learning.py

# Or run individual tests
python test_continuous_learning.py collect    # Test data collection
python test_continuous_learning.py validate   # Test validation
python test_continuous_learning.py check      # Test retrain decision
python test_continuous_learning.py bulk       # Test bulk collection
```

### 2. Manual Operations

#### Collect Single Data Point
```powershell
python continuous_learning_heatwave.py --mode collect --location "Delhi"
```

#### Manually Trigger Retraining
```powershell
python continuous_learning_heatwave.py --mode retrain
```

#### Run Continuous Loop (checks every 24h)
```powershell
python continuous_learning_heatwave.py --mode loop
```

### 3. Automated System (Recommended)

Start the automated scheduler that:
- Collects weather data every 6 hours
- Checks for retraining daily at 2:00 AM
- Retrains weekly or when 1000+ new samples collected

```powershell
python auto_collect_and_retrain.py
```

Press `Ctrl+C` to stop.

## 🔧 How It Works

### Data Collection Flow
```
Weather API → Auto-Label Heatwave → Validate Data → Store in CSV
```

**Auto-Labeling Rules:**
- `heatwave = 1` if temp ≥ 45°C (severe heatwave)
- `heatwave = 1` if temp ≥ 40°C AND humidity < 40% (dry heat)
- `heatwave = 0` otherwise

### Retraining Workflow
```
Check Conditions → Validate New Data → Merge with Base Dataset → 
Train New Model → Validate Accuracy → Backup Old Model → 
Deploy if Accuracy ≥ 90%
```

**Retraining Triggers:**
1. ⏰ **Time-based**: Every 168 hours (1 week)
2. 📊 **Data-based**: When 1000+ new samples collected
3. ✅ **Safety check**: Only deploy if accuracy ≥ 90%

### Data Validation
Before retraining, the system validates:
- ✅ Temperature values are realistic (0-60°C)
- ✅ Max temp ≥ Min temp (logical consistency)
- ✅ Heatwave labels are valid (0 or 1)
- ✅ No missing critical features

## 📂 Data Storage

```
datasets/
├── india_weather_data.csv          # Master dataset (grows over time)
└── collected_weather_data.csv      # New data buffer (cleared after retrain)

backend/
├── heatwave_model.pkl              # Current production model
├── heatwave_scaler.pkl             # Feature scaler
├── heatwave_features.pkl           # Feature configuration
└── models/
    └── heatwave/
        ├── training_metadata.json  # Training history
        └── backups/                # Previous model versions
```

## 📊 Monitoring

### Check Training Metadata
```powershell
# View last training info
cat models/heatwave/training_metadata.json
```

**Example output:**
```json
{
  "last_training_time": "2026-02-20T14:30:00",
  "total_samples": 131086,
  "new_samples_added": 31,
  "accuracy": 0.9762,
  "roc_auc": 0.9931,
  "model_version": 2
}
```

### Check Collected Data
```powershell
# View collected samples
python -c "import pandas as pd; df = pd.read_csv('../datasets/collected_weather_data.csv'); print(f'Collected: {len(df)} samples')"
```

## ⚙️ Configuration

Edit `continuous_learning_heatwave.py` to customize:

```python
system = ContinuousLearningSystem(
    base_dataset_path='../datasets/india_weather_data.csv',
    new_data_path='../datasets/collected_weather_data.csv',
    model_dir='models/heatwave',
    retrain_interval_hours=168  # Change to adjust retrain frequency
)
```

Edit `auto_collect_and_retrain.py` to customize schedule:

```python
# Collect every 3 hours instead of 6
schedule.every(3).hours.do(collect_current_weather)

# Check for retraining every 6 hours instead of daily
schedule.every(6).hours.do(check_and_retrain)
```

## 🛡️ Safety Features

1. **Model Backup** - Old model is backed up before deploying new one
2. **Accuracy Threshold** - Only deploys if new model accuracy ≥ 90%
3. **Data Validation** - Rejects invalid/corrupt data
4. **Version Control** - Tracks model versions in metadata
5. **Rollback Capability** - Backups stored in `models/heatwave/backups/`

## 🐛 Troubleshooting

### Issue: "Insufficient valid new data"
**Solution:** Collect more samples (need at least 50 valid samples)
```powershell
python test_continuous_learning.py bulk
```

### Issue: "New model accuracy below threshold"
**Problem:** Bad data quality or too few samples
**Solution:** 
1. Check data quality in collected_weather_data.csv
2. Increase sample size before retraining
3. Verify auto-labeling rules are correct

### Issue: Model not updating
**Check:**
1. Last training time: `cat models/heatwave/training_metadata.json`
2. New samples count: Check collected_weather_data.csv
3. Retrain interval: Default is 168 hours (1 week)

## 📈 Performance Expectations

- **Initial Model**: 97.60% accuracy (131,055 samples)
- **After Retraining**: Should maintain ≥ 90% accuracy
- **Data Collection**: ~4 samples/location every 6 hours = ~16 samples/day per location
- **Retraining Frequency**: Weekly (168 hours) or at 1000 samples

## 💡 Best Practices

1. **Start Small**: Test with manual collection first
2. **Monitor Quality**: Check validation rates regularly
3. **Gradual Rollout**: Start automated collection for 1-2 locations
4. **Backup Models**: Keep backups before major changes
5. **Verify Labels**: Periodically check auto-labeled heatwave values

## 🔮 Future Improvements

- [ ] Add manual label correction interface
- [ ] Implement incremental learning (partial retraining)
- [ ] Add A/B testing for model comparison
- [ ] Send email alerts on retraining success/failure
- [ ] Add Grafana dashboard for monitoring
- [ ] Implement ensemble models
- [ ] Add support for other disasters (flood, cyclone, etc.)

## 📞 Usage Examples

### Example 1: Daily Automated System
```powershell
# Run this in background or as Windows service
python auto_collect_and_retrain.py
```

### Example 2: Manual Weekly Retraining
```powershell
# Add to Windows Task Scheduler (run every Sunday at 2 AM)
python continuous_learning_heatwave.py --mode retrain
```

### Example 3: Collect from Custom Source
```python
from continuous_learning_heatwave import ContinuousLearningSystem

system = ContinuousLearningSystem()

# Your custom weather data
weather = {
    'date': '2026-02-20T15:00:00',
    'latitude': 28.6139,
    'longitude': 77.2090,
    'max_temperature': 44,
    'min_temperature': 30,
    'humidity': 32,
    # ... other fields
}

system.collect_weather_data(weather, 'MyCustomLocation')
```

---

**Status**: ✅ Production Ready
**Last Updated**: February 20, 2026
**Model Version**: 1 → Auto-incrementing
