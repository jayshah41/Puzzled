from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    commodities = models.JSONField(default=list)

    TIER_CHOICES = [
        (0, "Basic"),
        (1, "Paid"),
        (2, "Admin")
    ]
    
    tier_level = models.IntegerField(choices=TIER_CHOICES, default=0)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    

    def __str__(self):
        return f"{self.email} -  (Tier {self.tier_level})"
