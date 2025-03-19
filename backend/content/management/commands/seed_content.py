from django.core.management.base import BaseCommand
from content.models import EditableContent

class Command(BaseCommand):

    def handle(self, *args, **options):
        self.create_editable_content()


    def create_editable_content(self):
        print("Seeding editable content...")

        content_data = [
            {
                "component": "Hero",
                "section": "title",
                "text_value": "MakCorp has modernised how our clients invest in Mining, Oil & Gas."
            },
            {
                "component": "Hero",
                "section": "intro",
                "text_value": "Compare & analyse ASX resource companies, including"
            },
            {
                "component": "Hero",
                "section": "bulletPoints",
                "text_value": "Over 30,000 ASX projects/tenements including commodities, stages, locations, jorcs and more#Over 8,500 directors including remuneration and shareholdings#Over 2,700 capital raises and their information#Over 29,000 Top 20 shareholders transactions#Financials including quarterlies, half yearly and annual"
            },
            {
                "component": "Services",
                "section": "heading",
                "text_value": "Services we provide"
            },
            {
                "component": "Services",
                "section": "paragraphOne",
                "text_value": "Makcorp provides a wide range of services for opportunities related to the mining industry. Whether you are an investor or a business looking to expand your footprint within the industry, MakCorp has tools available to provide research and analytics on mining organisations listed on the ASX."
            },
            {
                "component": "Services",
                "section": "paragraphTwo",
                "text_value": "The MakCorp platform can help you become more successful whether you are a retail investor, a corporate investor, or a business owner. Let us help you find your next opportunity for growth."
            },
            {
                "component": "Services",
                "section": "title1",
                "text_value": "Commodity Pricing"
            },
            {
                "component": "Services",
                "section": "content1",
                "text_value": "See the prices for each commodity on a daily basis including potential value of JORCS."
            },
            {
                "component": "Services",
                "section": "title2",
                "text_value": "Stock Performance"
            },
            {
                "component": "Services",
                "section": "content2",
                "text_value": "See the performances on stocks by any period since 2018 including daily, weekly, monthly, and yearly."
            },
            {
                "component": "Services",
                "section": "title3",
                "text_value": "Data Services"
            },
            {
                "component": "Services",
                "section": "content3",
                "text_value": "Contact us for other data services including project research and director research."
            },
            {
                "component": "Values",
                "section": "heading",
                "text_value": "MakCorp's Value to Clients"
            },
            {
                "component": "Values",
                "section": "title1",
                "text_value": "We save you time"
            },
            {
                "component": "Values",
                "section": "content1",
                "text_value": "We save you time; We provide the research that is often time consuming to allow our clients to focus on managing their investments, not finding them."
            },
            {
                "component": "Values",
                "section": "title2",
                "text_value": "Visualization of Key Data"
            },
            {
                "component": "Values",
                "section": "content2",
                "text_value": "MakCorp provides in depth data in a visual interface. Our clients aren't just limited to searching by a company or a code, but by project areas, directors and financial indicators."
            },
            {
                "component": "Values",
                "section": "title3",
                "text_value": "Critical Information",
            },
            {
                "component": "Values",
                "section": "content3",
                "text_value": "MakCorp uses its research team to compile the most critical data in researching resource stocks. Our goal is to connect our clients with the right data and tools to unleash their Investment potential.",
            },
            {
                "component": "Values",
                "section": "title4",
                "text_value": "Time Saving Analytics",
            },
            {
                "component": "Values",
                "section": "content4",
                "text_value": "Dissect and query over 600 data points from projects, market data, directors, top 20, financials in seconds, not hours, days or weeks that it would take to do manually."
            },
            {
                "component": "Contact",
                "section": "title",
                "text_value": "Meet Our Team"
            },
            {
                "component": "Contact",
                "section": "introText",
                "text_value": "Our team has over 50 years combined experience in the resource sector, from working on mine sites to ERP software reviews."
            },
            {
                "component": "Contact",
                "section": "name1",
                "text_value": "Steve Rosewell"
            },
            {
                "component": "Contact",
                "section": "role1",
                "text_value": "Executive Chairman"
            },
            {
                "component": "Contact",
                "section": "phone1",
                "text_value": "+61 (4) 0555 1055"
            },
            {
                "component": "Contact",
                "section": "email1",
                "text_value": "steve@makcorp.com.au"
            },
            {
                "component": "Contact",
                "section": "name2",
                "text_value": "Robert Williamson"
            },
            {
                "component": "Contact",
                "section": "role2",
                "text_value": "Director"
            },
            {
                "component": "Contact",
                "section": "phone2",
                "text_value": ""
            },
            {
                "component": "Contact",
                "section": "email2",
                "text_value": "robert@makcorp.com.au"
            },
            {
                "component": "Contact",
                "section": "name3",
                "text_value": "Scott Yull"
            },
            {
                "component": "Contact",
                "section": "role3",
                "text_value": "Director"
            },
            {
                "component": "Contact",
                "section": "phone3",
                "text_value": ""
            },
            {
                "component": "Contact",
                "section": "email3",
                "text_value": "info@makcorp.com.au"
            },
            {
                "component": "Contact",
                "section": "name4",
                "text_value": "Emmanuel Heyndrickx"
            },
            {
                "component": "Contact",
                "section": "role4",
                "text_value": "Executive Director"
            },
            {
                "component": "Contact",
                "section": "phone4",
                "text_value": "+44 7739 079 787"
            },
            {
                "component": "Contact",
                "section": "email4",
                "text_value": "emmanuel@makcorp.com.au"
            },
            {
                "component": "Pricing",
                "section": "heading",
                "text_value": "MakCorp Platform through Affordable Subscriptions"
            },
            {
                "component": "Pricing",
                "section": "content",
                "text_value": "The MakCorp platform provides our users with access to 6 key data modules with over 600 data points to provide our clients with the ability to make better informed investment decisions. As an example, using projects data, users can seamlessly filter based upon key indicators like commodity type, geographic location or project stage to identify potential investment or client oppotunities."
            },
            {
                "component": "Products",
                "section": "heading",
                "text_value": "MakCorp is more than a platform"
            },
            {
                "component": "Products",
                "section": "content",
                "text_value": "MakCorp offers unparalleled access to immediate and essential information for the resources sector. Our offering provides our clients with the tools they need to see data, the way they want to. MakCorp prides itself on using interactive technology to help visualize key metrics to improve investment decisions."
            }
        ]

        for data in content_data:
            content = EditableContent(
                component=data["component"],
                section=data["section"],
                text_value=data["text_value"]
            )
            content.save()
            self.stdout.write(self.style.SUCCESS(f"Created content for component: {content.component}, section: {content.section}"))

        self.stdout.write(self.style.SUCCESS("Successfully seeded editable content"))