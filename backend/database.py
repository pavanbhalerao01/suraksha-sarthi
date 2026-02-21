"""
Database module for Suraksha Sathi
Uses SQLite for storing alerts and rescue team information
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Database file path
DB_PATH = Path(__file__).parent / "suraksha_sathi.db"

class Database:
    """SQLite database manager for alerts and rescue teams"""
    
    def __init__(self):
        self.db_path = str(DB_PATH)
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create rescue teams table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rescue_teams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team_name TEXT NOT NULL,
                team_type TEXT NOT NULL,
                disaster_types TEXT NOT NULL,
                contact_number TEXT NOT NULL,
                email TEXT,
                location TEXT,
                latitude REAL,
                longitude REAL,
                available BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create alerts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_type TEXT NOT NULL,
                disaster_type TEXT NOT NULL,
                disaster_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                severity TEXT NOT NULL,
                location TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                affected_area TEXT,
                affected_people TEXT,
                sent_to TEXT NOT NULL,
                sent_by TEXT NOT NULL,
                recipient_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'SENT',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            )
        """)
        
        # Create alert recipients table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alert_recipients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id INTEGER NOT NULL,
                recipient_type TEXT NOT NULL,
                recipient_id INTEGER,
                recipient_name TEXT,
                recipient_contact TEXT,
                delivery_status TEXT DEFAULT 'PENDING',
                delivered_at TIMESTAMP,
                read_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (alert_id) REFERENCES alerts (id)
            )
        """)
        
        # Create citizens table (for citizen alerts)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS citizens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL UNIQUE,
                email TEXT,
                location TEXT,
                latitude REAL,
                longitude REAL,
                notification_enabled BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
        
        # Seed initial rescue teams if table is empty
        self.seed_rescue_teams()
        logger.info(f"✅ Database initialized at {self.db_path}")
    
    def seed_rescue_teams(self):
        """Seed initial rescue teams data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Check if teams already exist
        cursor.execute("SELECT COUNT(*) FROM rescue_teams")
        if cursor.fetchone()[0] > 0:
            conn.close()
            return
        
        # Initial rescue teams data
        teams = [
            ("Mumbai Fire Brigade", "FIREFIGHTER", "fire,flood,earthquake,forest_fire", "+91-22-101", "mumbai.fire@gov.in", "Mumbai, Maharashtra", 19.0760, 72.8777),
            ("Mumbai Flood Rescue", "FLOOD_RESCUE", "flood,cyclone", "+91-22-1916", "flood.mumbai@ndrf.gov.in", "Mumbai, Maharashtra", 19.0760, 72.8777),
            ("Pune NDRF Team", "NDRF", "flood,earthquake,landslide,forest_fire", "+91-20-1070", "pune.ndrf@gov.in", "Pune, Maharashtra", 18.5204, 73.8567),
            ("Pune Fire Services", "FIREFIGHTER", "fire,earthquake,forest_fire", "+91-20-101", "pune.fire@gov.in", "Pune, Maharashtra", 18.5204, 73.8567),
            ("Maharashtra Earthquake Response", "EARTHQUAKE_RESCUE", "earthquake", "+91-22-1070", "earthquake.mh@ndrf.gov.in", "Mumbai, Maharashtra", 19.0760, 72.8777),
            ("Nagpur Fire Brigade", "FIREFIGHTER", "fire,heatwave,forest_fire", "+91-712-101", "nagpur.fire@gov.in", "Nagpur, Maharashtra", 21.1458, 79.0882),
            ("Karnataka NDRF Mangaluru", "NDRF", "flood,cyclone,landslide,forest_fire", "+91-824-1070", "mangaluru.ndrf@gov.in", "Mangaluru, Karnataka", 12.9141, 74.8560),
            ("Kerala Flood Rescue", "FLOOD_RESCUE", "flood,landslide,cyclone", "+91-471-1070", "kerala.flood@ndrf.gov.in", "Thiruvananthapuram, Kerala", 8.5241, 76.9366),
            ("Delhi NDRF Headquarters", "NDRF", "earthquake,fire,flood,heatwave,forest_fire", "+91-11-1070", "delhi.ndrf@gov.in", "New Delhi", 28.6139, 77.2090),
            ("National Disaster Response Force", "NDRF", "cyclone,flood,earthquake,landslide,heatwave,forest_fire", "+91-11-26105763", "ndrf@nic.in", "New Delhi", 28.6139, 77.2090),
        ]
        
        cursor.executemany("""
            INSERT INTO rescue_teams 
            (team_name, team_type, disaster_types, contact_number, email, location, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, teams)
        
        conn.commit()
        conn.close()
        logger.info(f"✅ Seeded {len(teams)} rescue teams")
    
    def save_alert(self, alert_data: Dict) -> int:
        """Save a new alert to database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO alerts 
            (alert_type, disaster_type, disaster_id, title, description, severity, 
             location, latitude, longitude, affected_area, affected_people, 
             sent_to, sent_by, recipient_count, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert_data.get('alert_type'),
            alert_data.get('disaster_type'),
            alert_data.get('disaster_id'),
            alert_data.get('title'),
            alert_data.get('description'),
            alert_data.get('severity'),
            alert_data.get('location'),
            alert_data.get('latitude'),
            alert_data.get('longitude'),
            alert_data.get('affected_area'),
            alert_data.get('affected_people'),
            alert_data.get('sent_to'),
            alert_data.get('sent_by'),
            alert_data.get('recipient_count', 0),
            json.dumps(alert_data.get('metadata', {}))
        ))
        
        alert_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"✅ Alert saved with ID: {alert_id}")
        return alert_id
    
    def get_rescue_teams_for_disaster(self, disaster_type: str) -> List[Dict]:
        """Get all rescue teams that handle a specific disaster type"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, team_name, team_type, disaster_types, contact_number, 
                   email, location, available
            FROM rescue_teams
            WHERE disaster_types LIKE ? AND available = 1
        """, (f'%{disaster_type}%',))
        
        teams = []
        for row in cursor.fetchall():
            teams.append({
                'id': row[0],
                'team_name': row[1],
                'team_type': row[2],
                'disaster_types': row[3].split(','),
                'contact_number': row[4],
                'email': row[5],
                'location': row[6],
                'available': bool(row[7])
            })
        
        conn.close()
        return teams
    
    def save_alert_recipients(self, alert_id: int, recipients: List[Dict]):
        """Save alert recipients"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        recipient_data = [
            (alert_id, r.get('recipient_type'), r.get('recipient_id'), 
             r.get('recipient_name'), r.get('recipient_contact'))
            for r in recipients
        ]
        
        cursor.executemany("""
            INSERT INTO alert_recipients 
            (alert_id, recipient_type, recipient_id, recipient_name, recipient_contact)
            VALUES (?, ?, ?, ?, ?)
        """, recipient_data)
        
        conn.commit()
        conn.close()
    
    def get_citizens_for_location(self, location: str = None, radius_km: float = 50) -> List[Dict]:
        """Get citizens for alert (can be filtered by location)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # For now, return all citizens with notifications enabled
        # In production, implement geospatial filtering
        cursor.execute("""
            SELECT id, name, phone, email, location
            FROM citizens
            WHERE notification_enabled = 1
        """)
        
        citizens = []
        for row in cursor.fetchall():
            citizens.append({
                'id': row[0],
                'name': row[1],
                'phone': row[2],
                'email': row[3],
                'location': row[4]
            })
        
        conn.close()
        return citizens
    
    def get_alert_history(self, limit: int = 50) -> List[Dict]:
        """Get recent alert history"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, alert_type, disaster_type, title, severity, location, 
                   sent_to, recipient_count, created_at
            FROM alerts
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        
        alerts = []
        for row in cursor.fetchall():
            alerts.append({
                'id': row[0],
                'alert_type': row[1],
                'disaster_type': row[2],
                'title': row[3],
                'severity': row[4],
                'location': row[5],
                'sent_to': row[6],
                'recipient_count': row[7],
                'created_at': row[8]
            })
        
        conn.close()
        return alerts

# Global database instance
db = Database()
