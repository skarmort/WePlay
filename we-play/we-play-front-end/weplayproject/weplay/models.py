from django.db import models
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
import re
import pycountry
from django.contrib.auth.hashers import make_password, check_password

class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    
    # Country code field (using ISO 3166-1 alpha-2 codes)
    country_code = models.CharField(max_length=5, blank=True, null=True, 
                                   choices=[(country.alpha_2, f"{country.name} (+{get_country_calling_code(country.alpha_2)})") 
                                           for country in pycountry.countries 
                                           if hasattr(country, 'calling_codes') and country.calling_codes],
                                   help_text="Select your country code")
    
    # Phone number field (without country code)
    phone_number = models.CharField(max_length=20, blank=True, null=True,
                                   help_text="Enter your phone number without the country code")
    
    # Full phone number (computed property)
    @property
    def full_phone_number(self):
        if self.country_code and self.phone_number:
            calling_code = get_country_calling_code(self.country_code)
            if calling_code:
                return f"+{calling_code}{self.phone_number}"
        return None
    
    dob = models.DateField(blank=True, null=True)
    password = models.CharField(max_length=255)  # Will be hashed in practice
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    def save(self, *args, **kwargs):
        # If password is provided and not already hashed, hash it
        if self.password and not self.password.startswith('pbkdf2_sha256$'):
            self.set_password(self.password)
        self.clean()
        super().save(*args, **kwargs)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'  # Optional: to use exact table name as SQL
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.username} - {self.email}"
    
    def clean(self):
        # Validation for phone number format
        if self.phone_number and self.country_code:
            calling_code = get_country_calling_code(self.country_code)
            if not calling_code:
                raise ValidationError({'country_code': 'Invalid country code selected'})
            
            # Basic validation for phone number format (adjust regex as needed)
            if not re.match(r'^[0-9]{5,15}$', self.phone_number):
                raise ValidationError({'phone_number': 'Enter a valid phone number (digits only, 5-15 characters)'})
        
        # If phone number is provided but no country code
        elif self.phone_number and not self.country_code:
            raise ValidationError({'country_code': 'Country code is required when providing a phone number'})
        
        # If country code is provided but no phone number
        elif self.country_code and not self.phone_number:
            raise ValidationError({'phone_number': 'Phone number is required when selecting a country code'})
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


# Helper function to get country calling code
def get_country_calling_code(country_code):
    try:
        country = pycountry.countries.get(alpha_2=country_code)
        if hasattr(country, 'calling_codes') and country.calling_codes:
            return country.calling_codes[0]  # Return the first calling code
    except:
        pass
    return None


# Alternative approach if you don't want to use pycountry:
# You can define a static list of common country codes
COMMON_COUNTRY_CODES = [
    ('US', 'United States (+1)'),
    ('GB', 'United Kingdom (+44)'),
    ('DE', 'Germany (+49)'),
    ('FR', 'France (+33)'),
    ('IT', 'Italy (+39)'),
    ('ES', 'Spain (+34)'),
    ('CA', 'Canada (+1)'),
    ('AU', 'Australia (+61)'),
    ('JP', 'Japan (+81)'),
    ('CN', 'China (+86)'),
    ('IN', 'India (+91)'),
    ('BR', 'Brazil (+55)'),
    ('RU', 'Russia (+7)'),
    ('MX', 'Mexico (+52)'),
    # Add more countries as needed
]

# If you prefer the static list, replace the country_code field with:
# country_code = models.CharField(max_length=5, blank=True, null=True, 
#                                choices=COMMON_COUNTRY_CODES,
#                                help_text="Select your country code")