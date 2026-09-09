export interface TimezoneOption {
  value: string;
  label: string;
  region: string;
  offset: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'Asia/Karachi', label: 'Pakistan (Islamabad, Karachi, Lahore)', region: 'South Asia', offset: 'UTC+05:00' },
  { value: 'Asia/Kolkata', label: 'India (New Delhi, Mumbai, Bengaluru)', region: 'South Asia', offset: 'UTC+05:30' },
  { value: 'Asia/Dhaka', label: 'Bangladesh (Dhaka)', region: 'South Asia', offset: 'UTC+06:00' },
  { value: 'Asia/Colombo', label: 'Sri Lanka (Colombo)', region: 'South Asia', offset: 'UTC+05:30' },
  { value: 'Asia/Kathmandu', label: 'Nepal (Kathmandu)', region: 'South Asia', offset: 'UTC+05:45' },
  { value: 'Asia/Dubai', label: 'United Arab Emirates (Dubai, Abu Dhabi)', region: 'Middle East', offset: 'UTC+04:00' },
  { value: 'Asia/Riyadh', label: 'Saudi Arabia (Riyadh, Jeddah, Mecca)', region: 'Middle East', offset: 'UTC+03:00' },
  { value: 'Asia/Qatar', label: 'Qatar (Doha)', region: 'Middle East', offset: 'UTC+03:00' },
  { value: 'Asia/Muscat', label: 'Oman (Muscat)', region: 'Middle East', offset: 'UTC+04:00' },
  { value: 'Asia/Kuwait', label: 'Kuwait (Kuwait City)', region: 'Middle East', offset: 'UTC+03:00' },
  { value: 'Asia/Bahrain', label: 'Bahrain (Manama)', region: 'Middle East', offset: 'UTC+03:00' },
  { value: 'Asia/Singapore', label: 'Singapore (Singapore)', region: 'Southeast Asia', offset: 'UTC+08:00' },
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia (Kuala Lumpur)', region: 'Southeast Asia', offset: 'UTC+08:00' },
  { value: 'Asia/Jakarta', label: 'Indonesia (Jakarta)', region: 'Southeast Asia', offset: 'UTC+07:00' },
  { value: 'Asia/Bangkok', label: 'Thailand (Bangkok)', region: 'Southeast Asia', offset: 'UTC+07:00' },
  { value: 'Asia/Manila', label: 'Philippines (Manila)', region: 'Southeast Asia', offset: 'UTC+08:00' },
  { value: 'Asia/Tokyo', label: 'Japan (Tokyo)', region: 'East Asia', offset: 'UTC+09:00' },
  { value: 'Asia/Seoul', label: 'South Korea (Seoul)', region: 'East Asia', offset: 'UTC+09:00' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', region: 'East Asia', offset: 'UTC+08:00' },
  { value: 'Asia/Shanghai', label: 'China (Beijing, Shanghai)', region: 'East Asia', offset: 'UTC+08:00' },
  { value: 'Europe/London', label: 'United Kingdom (London)', region: 'Europe', offset: 'UTC+00:00 / +01:00' },
  { value: 'Europe/Paris', label: 'France (Paris)', region: 'Europe', offset: 'UTC+01:00 / +02:00' },
  { value: 'Europe/Berlin', label: 'Germany (Berlin, Frankfurt)', region: 'Europe', offset: 'UTC+01:00 / +02:00' },
  { value: 'Europe/Istanbul', label: 'Turkey (Istanbul, Ankara)', region: 'Europe', offset: 'UTC+03:00' },
  { value: 'America/New_York', label: 'United States (New York - Eastern)', region: 'Americas', offset: 'UTC-05:00 / -04:00' },
  { value: 'America/Chicago', label: 'United States (Chicago - Central)', region: 'Americas', offset: 'UTC-06:00 / -05:00' },
  { value: 'America/Denver', label: 'United States (Denver - Mountain)', region: 'Americas', offset: 'UTC-07:00 / -06:00' },
  { value: 'America/Los_Angeles', label: 'United States (Los Angeles - Pacific)', region: 'Americas', offset: 'UTC-08:00 / -07:00' },
  { value: 'America/Toronto', label: 'Canada (Toronto, Montreal)', region: 'Americas', offset: 'UTC-05:00 / -04:00' },
  { value: 'Australia/Sydney', label: 'Australia (Sydney, Melbourne)', region: 'Oceania', offset: 'UTC+10:00 / +11:00' },
  { value: 'Africa/Cairo', label: 'Egypt (Cairo)', region: 'Africa', offset: 'UTC+02:00' },
  { value: 'Africa/Lagos', label: 'Nigeria (Lagos)', region: 'Africa', offset: 'UTC+01:00' },
  { value: 'Africa/Johannesburg', label: 'South Africa (Johannesburg)', region: 'Africa', offset: 'UTC+02:00' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)', region: 'Universal', offset: 'UTC+00:00' },
];

export const POPULAR_TIMEZONES = TIMEZONE_OPTIONS;

