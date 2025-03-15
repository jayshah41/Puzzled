from django.contrib.auth.models import AbstractUser # extends default user mode
from django.db import models

# Create your models here.
# User 
# Types of Users = admin and client, 
# 3 levels of tiers = level 0 (basic), level 1 (all features), level 2 (admin access = all features + editting)
# Catagories; First Name, Last Name, email Add (primary key), phone number, country, state, Top 3 commodities (list?), tier level, user types, password
# we want to be able to know if a user is currently online through like an  

class User(AbstractUser):
    
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    commodities = models.JSONField(default=list)

    TIER_CHOICES = [
        (0, "Basic"),
        (1, "Paid"),
        (2, "Admin"),
    ]
    
    tier_level = models.IntegerField(choices=TIER_CHOICES, default=0)

    def __str__(self):
        return f"{self.email} - {self.user_type} (Tier {self.tier_level})"