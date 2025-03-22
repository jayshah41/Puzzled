from django.test import TestCase
from api.models import Company, CapitalRaises, Shareholders, Projects
from api.serializers import AggregatedCompanySerializer

class AggregatedCompanySerializerTest(TestCase):

    def setUp(self):
        self.company = Company.objects.create(asx_code="XYZ", company_name="XYZ Mining")
        self.cap_raise = CapitalRaises.objects.create(asx_code=self.company, bank_balance=250000.0, raise_type="Equity")
        self.shareholder = Shareholders.objects.create(
            asx_code=self.company,
            entity="Investor A",
            value=500000.0,
            project_commodities="Gold",
            project_area="WA",
            transaction_type="Buy"
        )
        self.project = Projects.objects.create(
            asx_code=self.company,
            commodity="Copper",
            activity="Drilling",
            project_name="Copper Project"
        )

    def test_aggregated_company_serializer_fields(self):
        serializer = AggregatedCompanySerializer(instance=self.company)
        data = serializer.data

        self.assertEqual(data['asx_code'], "XYZ")
        self.assertEqual(data['company_name'], "XYZ Mining")
        self.assertEqual(data['bank_balance'], 250000.0)
        self.assertEqual(data['value'], 500000.0)
        self.assertEqual(data['priority_commodity'], "Copper")
        self.assertEqual(data['project_area'], "WA")
