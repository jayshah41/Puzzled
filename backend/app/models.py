from django.contrib.auth.models import AbstractUser # extends default user mode
from django.db import models

# Create your models here.
# User 
# Types of Users = admin and client, 
# 3 levels of tiers = level 0 (basic), level 1 (all features), level 2 (admin access = all features + editting)
# Catagories; First Name, Last Name, email Add (primary key), phone number, country, state, Top 3 commodities (list?), tier level, user types, password
# we want to be able to know if a user is currently online through like an  

class User(AbstractUser):

    # catagories
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    commodities = models.JSONField(default=list)  # Store list of commodities


    # Tier system
    TIER_CHOICES = [
        (0, "Basic"),
        (1, "All Features"),
        (2, "Admin Access"),
    ]
    tier_level = models.IntegerField(choices=TIER_CHOICES, default=0)

    # User type
    USER_TYPE_CHOICES = [
        ("admin", "Admin"),
        ("client", "Client"),
    ]
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default="client")

    # Auto-set admin based on tier
    is_admin = models.BooleanField(default=False)

    # Track last login to determine if online
    last_seen = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Automatically make users admin if they are tier 2
        if self.tier_level == 2:
            self.is_admin = True
        super().save(*args, **kwargs)

    def is_online(self):
        """Check if user is online (active in last 5 minutes)."""
        from django.utils.timezone import now
        return (now() - self.last_seen).total_seconds() < 300  # 5 min threshold

    def __str__(self):
        return f"{self.email} - {self.user_type} (Tier {self.tier_level})"
  
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] 



class EditableContent(models.Model):
    component = models.TextField(max_length=100)
    section = models.TextField(max_length=100)
    text_value = models.TextField()