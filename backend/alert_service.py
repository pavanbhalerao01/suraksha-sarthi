"""
Alert Service for Suraksha Sathi
Handles sending alerts to rescue teams and citizens
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime
from database import db

logger = logging.getLogger(__name__)

class AlertService:
    """Service for managing disaster alerts"""
    
    def __init__(self):
        self.db = db
    
    async def send_rescue_team_alert(self, alert_data: Dict) -> Dict:
        """
        Send alert to rescue teams based on disaster type
        
        Args:
            alert_data: {
                'disaster_id': str,
                'disaster_type': str,
                'title': str,
                'description': str,
                'severity': str,
                'location': str,
                'latitude': float,
                'longitude': float,
                'affected_area': str,
                'affected_people': str
            }
        
        Returns:
            Dict with alert details and rescue teams notified
        """
        try:
            disaster_type = alert_data.get('disaster_type', '').lower()
            
            # Get relevant rescue teams
            rescue_teams = self.db.get_rescue_teams_for_disaster(disaster_type)
            
            if not rescue_teams:
                logger.warning(f"No rescue teams found for disaster type: {disaster_type}")
                return {
                    'success': False,
                    'message': f'No rescue teams available for {disaster_type}',
                    'teams_notified': 0
                }
            
            # Save alert to database
            alert_record = {
                'alert_type': 'RESCUE_TEAM',
                'disaster_type': disaster_type,
                'disaster_id': alert_data.get('disaster_id'),
                'title': alert_data.get('title'),
                'description': alert_data.get('description'),
                'severity': alert_data.get('severity'),
                'location': alert_data.get('location'),
                'latitude': alert_data.get('latitude'),
                'longitude': alert_data.get('longitude'),
                'affected_area': alert_data.get('affected_area'),
                'affected_people': alert_data.get('affected_people'),
                'sent_to': 'RESCUE_TEAMS',
                'sent_by': alert_data.get('sent_by', 'NDRF_ADMIN'),
                'recipient_count': len(rescue_teams),
                'metadata': {
                    'forecast_7day': alert_data.get('forecast_7day'),
                    'peak_date': alert_data.get('peak_date')
                }
            }
            
            alert_id = self.db.save_alert(alert_record)
            
            # Save individual rescue team recipients
            recipients = [
                {
                    'recipient_type': 'RESCUE_TEAM',
                    'recipient_id': team['id'],
                    'recipient_name': team['team_name'],
                    'recipient_contact': team['contact_number']
                }
                for team in rescue_teams
            ]
            
            self.db.save_alert_recipients(alert_id, recipients)
            
            # In production: Send actual SMS/Email/Push notifications
            logger.info(f"📢 Rescue team alert sent to {len(rescue_teams)} teams for {disaster_type}")
            
            return {
                'success': True,
                'alert_id': alert_id,
                'disaster_type': disaster_type,
                'teams_notified': len(rescue_teams),
                'rescue_teams': rescue_teams,
                'message': f'Alert sent to {len(rescue_teams)} rescue team(s)',
                'sent_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error sending rescue team alert: {e}")
            return {
                'success': False,
                'message': f'Failed to send rescue team alert: {str(e)}',
                'teams_notified': 0
            }
    
    async def send_citizen_alert(self, alert_data: Dict) -> Dict:
        """
        Send alert to all citizens in affected area
        
        Args:
            alert_data: {
                'disaster_id': str,
                'disaster_type': str,
                'title': str,
                'description': str,
                'severity': str,
                'location': str,
                'latitude': float,
                'longitude': float,
                'affected_area': str,
                'affected_people': str,
                'safety_instructions': str
            }
        
        Returns:
            Dict with alert details and citizens notified
        """
        try:
            disaster_type = alert_data.get('disaster_type', '').lower()
            location = alert_data.get('location', '')
            
            # Get citizens to notify (in production: filter by location/radius)
            citizens = self.db.get_citizens_for_location(location)
            
            # For demo: simulate citizen base if empty
            if not citizens:
                citizens = self._get_demo_citizens(location)
            
            # Save alert to database
            alert_record = {
                'alert_type': 'CITIZEN',
                'disaster_type': disaster_type,
                'disaster_id': alert_data.get('disaster_id'),
                'title': alert_data.get('title'),
                'description': alert_data.get('description'),
                'severity': alert_data.get('severity'),
                'location': location,
                'latitude': alert_data.get('latitude'),
                'longitude': alert_data.get('longitude'),
                'affected_area': alert_data.get('affected_area'),
                'affected_people': alert_data.get('affected_people'),
                'sent_to': 'CITIZENS',
                'sent_by': alert_data.get('sent_by', 'NDRF_ADMIN'),
                'recipient_count': len(citizens),
                'metadata': {
                    'safety_instructions': alert_data.get('safety_instructions'),
                    'forecast_7day': alert_data.get('forecast_7day'),
                    'peak_date': alert_data.get('peak_date')
                }
            }
            
            alert_id = self.db.save_alert(alert_record)
            
            # Save individual citizen recipients
            recipients = [
                {
                    'recipient_type': 'CITIZEN',
                    'recipient_id': citizen.get('id'),
                    'recipient_name': citizen.get('name'),
                    'recipient_contact': citizen.get('phone')
                }
                for citizen in citizens
            ]
            
            self.db.save_alert_recipients(alert_id, recipients)
            
            # In production: Send actual SMS/Email/Push notifications
            logger.info(f"📱 Citizen alert sent to {len(citizens)} citizens for {disaster_type} in {location}")
            
            return {
                'success': True,
                'alert_id': alert_id,
                'disaster_type': disaster_type,
                'location': location,
                'citizens_notified': len(citizens),
                'message': f'Alert sent to {len(citizens):,} citizen(s) in {location}',
                'sent_at': datetime.now().isoformat(),
                'sample_recipients': citizens[:5]  # Show first 5 for demo
            }
            
        except Exception as e:
            logger.error(f"Error sending citizen alert: {e}")
            return {
                'success': False,
                'message': f'Failed to send citizen alert: {str(e)}',
                'citizens_notified': 0
            }
    
    def _get_demo_citizens(self, location: str) -> List[Dict]:
        """Generate demo citizen data for testing"""
        # Estimate citizen count based on location
        citizen_counts = {
            'Mumbai': 12500000,
            'Pune': 3500000,
            'Nagpur': 2500000,
            'Nashik': 1500000,
            'Thiruvananthapuram': 950000,
            'Kochi': 2100000,
            'Mangaluru': 488000,
            'default': 500000
        }
        
        # Get estimated count
        count = citizen_counts.get(location, citizen_counts['default'])
        
        # Return simulated citizen data
        return [
            {
                'id': i,
                'name': f'Citizen {i}',
                'phone': f'+91-98123{i:05d}',
                'location': location
            }
            for i in range(min(5, count // 100000))  # Show sample
        ] + [{'estimated_total': count}]
    
    async def get_alert_history(self, alert_type: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """Get alert history"""
        alerts = self.db.get_alert_history(limit)
        
        if alert_type:
            alerts = [a for a in alerts if a['alert_type'] == alert_type]
        
        return alerts

# Global alert service instance
alert_service = AlertService()
