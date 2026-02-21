"""
Comprehensive database of major Indian cities for disaster monitoring
Includes state capitals, tier-1 and tier-2 cities, vulnerable areas
"""

# Major cities across all Indian states and union territories
INDIAN_CITIES = [
    # Andhra Pradesh
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6869, "lon": 83.2185, "district": "Visakhapatnam", "tier": 2, "vulnerable_to": ["cyclone", "flood"]},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "lat": 16.5062, "lon": 80.6480, "district": "Krishna", "tier": 2, "vulnerable_to": ["flood"]},
    {"name": "Guntur", "state": "Andhra Pradesh", "lat": 16.3067, "lon": 80.4365, "district": "Guntur", "tier": 2, "vulnerable_to": ["cyclone", "flood"]},
    {"name": "Tirupati", "state": "Andhra Pradesh", "lat": 13.6288, "lon": 79.4192, "district": "Tirupati", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Arunachal Pradesh
    {"name": "Itanagar", "state": "Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053, "district": "Papum Pare", "tier": 3, "vulnerable_to": ["landslide", "earthquake", "flood"]},
    
    # Assam
    {"name": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362, "district": "Kamrup", "tier": 2, "vulnerable_to": ["flood", "earthquake"]},
    {"name": "Silchar", "state": "Assam", "lat": 24.8333, "lon": 92.7789, "district": "Cachar", "tier": 3, "vulnerable_to": ["flood"]},
    {"name": "Jorhat", "state": "Assam", "lat": 26.7509, "lon": 94.2037, "district": "Jorhat", "tier": 3, "vulnerable_to": ["flood"]},
    
    # Bihar
    {"name": "Patna", "state": "Bihar", "lat": 25.5941, "lon": 85.1376, "district": "Patna", "tier": 2, "vulnerable_to": ["flood", "heatwave"]},
    {"name": "Gaya", "state": "Bihar", "lat": 24.7955, "lon": 85.0002, "district": "Gaya", "tier": 2, "vulnerable_to": ["flood", "heatwave"]},
    {"name": "Muzaffarpur", "state": "Bihar", "lat": 26.1225, "lon": 85.3906, "district": "Muzaffarpur", "tier": 2, "vulnerable_to": ["flood"]},
    {"name": "Bhagalpur", "state": "Bihar", "lat": 25.2425, "lon": 86.9842, "district": "Bhagalpur", "tier": 3, "vulnerable_to": ["flood"]},
    
    # Chhattisgarh
    {"name": "Raipur", "state": "Chhattisgarh", "lat": 21.2514, "lon": 81.6296, "district": "Raipur", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Bhilai", "state": "Chhattisgarh", "lat": 21.2095, "lon": 81.3790, "district": "Durg", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Delhi
    {"name": "New Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090, "district": "New Delhi", "tier": 1, "vulnerable_to": ["heatwave", "earthquake"]},
    
    # Goa
    {"name": "Panaji", "state": "Goa", "lat": 15.4909, "lon": 73.8278, "district": "North Goa", "tier": 3, "vulnerable_to": ["flood", "cyclone"]},
    {"name": "Margao", "state": "Goa", "lat": 15.2700, "lon": 73.9580, "district": "South Goa", "tier": 3, "vulnerable_to": ["flood"]},
    
    # Gujarat
    {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "district": "Ahmedabad", "tier": 1, "vulnerable_to": ["heatwave", "earthquake"]},
    {"name": "Surat", "state": "Gujarat", "lat": 21.1702, "lon": 72.8311, "district": "Surat", "tier": 1, "vulnerable_to": ["flood", "cyclone"]},
    {"name": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lon": 73.1812, "district": "Vadodara", "tier": 2, "vulnerable_to": ["flood"]},
    {"name": "Rajkot", "state": "Gujarat", "lat": 22.3039, "lon": 70.8022, "district": "Rajkot", "tier": 2, "vulnerable_to": ["cyclone"]},
    {"name": "Bhuj", "state": "Gujarat", "lat": 23.2420, "lon": 69.6669, "district": "Kutch", "tier": 3, "vulnerable_to": ["earthquake", "cyclone"]},
    
    # Haryana
    {"name": "Gurugram", "state": "Haryana", "lat": 28.4595, "lon": 77.0266, "district": "Gurugram", "tier": 1, "vulnerable_to": ["heatwave"]},
    {"name": "Faridabad", "state": "Haryana", "lat": 28.4089, "lon": 77.3178, "district": "Faridabad", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lon": 76.7794, "district": "Chandigarh", "tier": 1, "vulnerable_to": ["heatwave"]},
    
    # Himachal Pradesh
    {"name": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lon": 77.1734, "district": "Shimla", "tier": 3, "vulnerable_to": ["landslide", "earthquake"]},
    {"name": "Manali", "state": "Himachal Pradesh", "lat": 32.2396, "lon": 77.1887, "district": "Kullu", "tier": 3, "vulnerable_to": ["landslide"]},
    
    # Jharkhand
    {"name": "Ranchi", "state": "Jharkhand", "lat": 23.3441, "lon": 85.3096, "district": "Ranchi", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Jamshedpur", "state": "Jharkhand", "lat": 22.8046, "lon": 86.2029, "district": "East Singhbhum", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Karnataka
    {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "district": "Bengaluru Urban", "tier": 1, "vulnerable_to": ["heatwave"]},
    {"name": "Mysuru", "state": "Karnataka", "lat": 12.2958, "lon": 76.6394, "district": "Mysuru", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Mangaluru", "state": "Karnataka", "lat": 12.9141, "lon": 74.8560, "district": "Dakshina Kannada", "tier": 2, "vulnerable_to": ["flood", "cyclone"]},
    {"name": "Hubballi", "state": "Karnataka", "lat": 15.3647, "lon": 75.1240, "district": "Dharwad", "tier": 2, "vulnerable_to": ["flood"]},
    
    # Kerala
    {"name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366, "district": "Thiruvananthapuram", "tier": 2, "vulnerable_to": ["flood", "cyclone"]},
    {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673, "district": "Ernakulam", "tier": 2, "vulnerable_to": ["flood", "cyclone"]},
    {"name": "Kozhikode", "state": "Kerala", "lat": 11.2588, "lon": 75.7804, "district": "Kozhikode", "tier": 2, "vulnerable_to": ["flood", "landslide"]},
    {"name": "Thrissur", "state": "Kerala", "lat": 10.5276, "lon": 76.2144, "district": "Thrissur", "tier": 2, "vulnerable_to": ["flood"]},
    
    # Madhya Pradesh
    {"name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126, "district": "Bhopal", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577, "district": "Indore", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Jabalpur", "state": "Madhya Pradesh", "lat": 23.1815, "lon": 79.9864, "district": "Jabalpur", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lon": 78.1828, "district": "Gwalior", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Maharashtra
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "district": "Mumbai", "tier": 1, "vulnerable_to": ["flood", "cyclone"]},
    {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "district": "Pune", "tier": 1, "vulnerable_to": ["flood", "earthquake"]},
    {"name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882, "district": "Nagpur", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lon": 73.7898, "district": "Nashik", "tier": 2, "vulnerable_to": ["flood"]},
    {"name": "Aurangabad", "state": "Maharashtra", "lat": 19.8762, "lon": 75.3433, "district": "Aurangabad", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Kolhapur", "state": "Maharashtra", "lat": 16.7050, "lon": 74.2433, "district": "Kolhapur", "tier": 2, "vulnerable_to": ["flood"]},
    
    # Manipur
    {"name": "Imphal", "state": "Manipur", "lat": 24.8170, "lon": 93.9368, "district": "Imphal West", "tier": 3, "vulnerable_to": ["earthquake", "flood"]},
    
    # Meghalaya
    {"name": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lon": 91.8933, "district": "East Khasi Hills", "tier": 3, "vulnerable_to": ["landslide", "earthquake"]},
    {"name": "Cherrapunji", "state": "Meghalaya", "lat": 25.2676, "lon": 91.7320, "district": "East Khasi Hills", "tier": 3, "vulnerable_to": ["landslide", "flood"]},
    
    # Mizoram
    {"name": "Aizawl", "state": "Mizoram", "lat": 23.7271, "lon": 92.7176, "district": "Aizawl", "tier": 3, "vulnerable_to": ["landslide", "earthquake"]},
    
    # Nagaland
    {"name": "Kohima", "state": "Nagaland", "lat": 25.6747, "lon": 94.1086, "district": "Kohima", "tier": 3, "vulnerable_to": ["landslide", "earthquake"]},
    
    # Odisha
    {"name": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lon": 85.8245, "district": "Khordha", "tier": 2, "vulnerable_to": ["cyclone", "flood", "heatwave"]},
    {"name": "Cuttack", "state": "Odisha", "lat": 20.5000, "lon": 85.8833, "district": "Cuttack", "tier": 2, "vulnerable_to": ["cyclone", "flood"]},
    {"name": "Puri", "state": "Odisha", "lat": 19.8135, "lon": 85.8312, "district": "Puri", "tier": 3, "vulnerable_to": ["cyclone", "flood"]},
    {"name": "Berhampur", "state": "Odisha", "lat": 19.3150, "lon": 84.7941, "district": "Ganjam", "tier": 3, "vulnerable_to": ["cyclone"]},
    
    # Punjab
    {"name": "Ludhiana", "state": "Punjab", "lat": 30.9010, "lon": 75.8573, "district": "Ludhiana", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Amritsar", "state": "Punjab", "lat": 31.6340, "lon": 74.8723, "district": "Amritsar", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Jalandhar", "state": "Punjab", "lat": 31.3260, "lon": 75.5762, "district": "Jalandhar", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Rajasthan
    {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "district": "Jaipur", "tier": 1, "vulnerable_to": ["heatwave"]},
    {"name": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lon": 73.0243, "district": "Jodhpur", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Udaipur", "state": "Rajasthan", "lat": 24.5854, "lon": 73.7125, "district": "Udaipur", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Kota", "state": "Rajasthan", "lat": 25.2138, "lon": 75.8648, "district": "Kota", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Sikkim
    {"name": "Gangtok", "state": "Sikkim", "lat": 27.3389, "lon": 88.6065, "district": "East Sikkim", "tier": 3, "vulnerable_to": ["landslide", "earthquake"]},
    
    # Tamil Nadu
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "district": "Chennai", "tier": 1, "vulnerable_to": ["cyclone", "flood", "heatwave"]},
    {"name": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lon": 76.9558, "district": "Coimbatore", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lon": 78.1198, "district": "Madurai", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Tiruchirappalli", "state": "Tamil Nadu", "lat": 10.8155, "lon": 78.6947, "district": "Tiruchirappalli", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Salem", "state": "Tamil Nadu", "lat": 11.6643, "lon": 78.1460, "district": "Salem", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Telangana
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "district": "Hyderabad", "tier": 1, "vulnerable_to": ["flood", "heatwave"]},
    {"name": "Warangal", "state": "Telangana", "lat": 17.9784, "lon": 79.6000, "district": "Warangal Urban", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Tripura
    {"name": "Agartala", "state": "Tripura", "lat": 23.8315, "lon": 91.2868, "district": "West Tripura", "tier": 3, "vulnerable_to": ["flood", "earthquake"]},
    
    # Uttar Pradesh
    {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "district": "Lucknow", "tier": 1, "vulnerable_to": ["flood", "heatwave"]},
    {"name": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4499, "lon": 80.3319, "district": "Kanpur Nagar", "tier": 1, "vulnerable_to": ["heatwave"]},
    {"name": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739, "district": "Varanasi", "tier": 2, "vulnerable_to": ["flood", "heatwave"]},
    {"name": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081, "district": "Agra", "tier": 2, "vulnerable_to": ["heatwave"]},
    {"name": "Allahabad", "state": "Uttar Pradesh", "lat": 25.4358, "lon": 81.8463, "district": "Prayagraj", "tier": 2, "vulnerable_to": ["flood"]},
    {"name": "Meerut", "state": "Uttar Pradesh", "lat": 28.9845, "lon": 77.7064, "district": "Meerut", "tier": 2, "vulnerable_to": ["heatwave"]},
    
    # Uttarakhand
    {"name": "Dehradun", "state": "Uttarakhand", "lat": 30.3165, "lon": 78.0322, "district": "Dehradun", "tier": 2, "vulnerable_to": ["landslide", "earthquake", "flood"]},
    {"name": "Haridwar", "state": "Uttarakhand", "lat": 29.9457, "lon": 78.1642, "district": "Haridwar", "tier": 3, "vulnerable_to": ["flood"]},
    {"name": "Rishikesh", "state": "Uttarakhand", "lat": 30.0869, "lon": 78.2676, "district": "Dehradun", "tier": 3, "vulnerable_to": ["flood", "landslide"]},
    
    # West Bengal
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "district": "Kolkata", "tier": 1, "vulnerable_to": ["cyclone", "flood"]},
    {"name": "Howrah", "state": "West Bengal", "lat": 22.5958, "lon": 88.2636, "district": "Howrah", "tier": 2, "vulnerable_to": ["flood"]},
    {"name": "Durgapur", "state": "West Bengal", "lat": 23.5204, "lon": 87.3119, "district": "Paschim Bardhaman", "tier": 2, "vulnerable_to": ["flood"]},
    {"name": "Siliguri", "state": "West Bengal", "lat": 26.7271, "lon": 88.3953, "district": "Darjeeling", "tier": 2, "vulnerable_to": ["flood", "landslide"]},
    
    # Andaman and Nicobar Islands
    {"name": "Port Blair", "state": "Andaman and Nicobar Islands", "lat": 11.6234, "lon": 92.7265, "district": "South Andaman", "tier": 3, "vulnerable_to": ["cyclone", "earthquake"]},
    
    # Lakshadweep
    {"name": "Kavaratti", "state": "Lakshadweep", "lat": 10.5669, "lon": 72.6369, "district": "Lakshadweep", "tier": 3, "vulnerable_to": ["cyclone"]},
    
    # Puducherry
    {"name": "Puducherry", "state": "Puducherry", "lat": 11.9416, "lon": 79.8083, "district": "Puducherry", "tier": 3, "vulnerable_to": ["cyclone", "flood"]},
    
    # Jammu and Kashmir
    {"name": "Srinagar", "state": "Jammu and Kashmir", "lat": 34.0837, "lon": 74.7973, "district": "Srinagar", "tier": 2, "vulnerable_to": ["flood", "earthquake", "landslide"]},
    {"name": "Jammu", "state": "Jammu and Kashmir", "lat": 32.7266, "lon": 74.8570, "district": "Jammu", "tier": 2, "vulnerable_to": ["earthquake"]},
    
    # Ladakh
    {"name": "Leh", "state": "Ladakh", "lat": 34.1526, "lon": 77.5771, "district": "Leh", "tier": 3, "vulnerable_to": ["earthquake", "landslide"]},
]

# Summary statistics
def get_city_count():
    """Get total number of monitored cities"""
    return len(INDIAN_CITIES)

def get_cities_by_state(state: str):
    """Get all cities in a specific state"""
    return [city for city in INDIAN_CITIES if city["state"] == state]

def get_cities_by_disaster(disaster_type: str):
    """Get cities vulnerable to a specific disaster type"""
    return [city for city in INDIAN_CITIES if disaster_type in city["vulnerable_to"]]

def get_tier1_cities():
    """Get tier-1 cities (metros)"""
    return [city for city in INDIAN_CITIES if city["tier"] == 1]

def get_all_states():
    """Get list of all states"""
    return list(set(city["state"] for city in INDIAN_CITIES))

# Print summary
if __name__ == "__main__":
    print(f"Total monitored cities: {get_city_count()}")
    print(f"Total states/UTs: {len(get_all_states())}")
    print(f"\nCities vulnerable to flood: {len(get_cities_by_disaster('flood'))}")
    print(f"Cities vulnerable to cyclone: {len(get_cities_by_disaster('cyclone'))}")
    print(f"Cities vulnerable to earthquake: {len(get_cities_by_disaster('earthquake'))}")
    print(f"Cities vulnerable to landslide: {len(get_cities_by_disaster('landslide'))}")
    print(f"Cities vulnerable to heatwave: {len(get_cities_by_disaster('heatwave'))}")
