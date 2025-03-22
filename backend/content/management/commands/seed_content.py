from django.core.management.base import BaseCommand
from content.models import EditableContent, NewsCard

class Command(BaseCommand):

    def handle(self, *args, **options):
        self.create_editable_content()
        self.create_news_cards()


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
            },
            {
                "component": "ContactUs",
                "section": "heading",
                "text_value": "Ready to sign up?"
            },
            {
                "component": "ContactUs",
                "section": "content",
                "text_value": "You want to sign up but have a few uncertainties? Contact us through the form below, and we will respond back to you as soon as possible!"
            },
            {
                "component": "ContactUs",
                "section": "message",
                "text_value": "Message"
            },
            {
                "component": "ContactUs",
                "section": "firstName",
                "text_value": "First Name"
            },
            {
                "component": "ContactUs",
                "section": "lastName",
                "text_value": "Last Name"
            },
            {
                "component": "ContactUs",
                "section": "phoneNumber",
                "text_value": "Phone Number"
            },
            {
                "component": "ContactUs",
                "section": "email",
                "text_value": "Email"
            },
            {
                "component": "ContactUs",
                "section": "state",
                "text_value": "State"
            },
            {
                "component": "ContactUs",
                "section": "country",
                "text_value": "Country"
            },
            {
                "component": "ContactUs",
                "section": "referredBy",
                "text_value": "Referred By"
            },
            {
                "component": "ContactUs",
                "section": "commodityType1",
                "text_value": "Commodity Type 1"
            },
            {
                "component": "ContactUs",
                "section": "commodityType2",
                "text_value": "Commodity Type 2"
            },
            {
                "component": "ContactUs",
                "section": "commodityType3",
                "text_value": "Commodity Type 3"
            },
            {
                "component": "ContactUs",
                "section": "investmentCriteria",
                "text_value": "Investment Criteria"
            },
            {
                "component": "Products",
                "section": "title1",
                "text_value": "Visual Filtering"
            },
            {
                "component": "Products",
                "section": "content1",
                "text_value": "Clicking on data changes everything you look at. As soon as you click through a piece of data, it filters the entire dashboard instantly and saves your filter at the top of the dashboard.#Remove any filters with a click. Each dashboard gives the user a full view of data, the user has the ability to filter the information simply by clicking data.#Any field within the dashboard can be filtered!"
            },
            {
                "component": "Products",
                "section": "title2",
                "text_value": "Exclude Data"
            },
            {
                "component": "Products",
                "section": "content2",
                "text_value": "Any data that complicates the dashboard or dominates metrics can be removed by selecting the record type and deselecting it, which will update all of the models within the dashboard instantly.#Users can filter through data to find key information with ease. Examples may be filtering out regions or areas where projects exist that may present risks for investment, or removing commodities that are not important to the user."
            },
            {
                "component": "Products",
                "section": "title3",
                "text_value": "Field Level Filtering"
            },
            {
                "component": "Products",
                "section": "content3",
                "text_value": "Our platform comes with the ability to use a search bar to filter out data based upon any field within our database. Typing in a letter, like A would prompt the user for any of the fields in the database like \"ASX Code\" where the user can then select as specific ASX Code.#The applications for this are extremely powerful, like \"Bank Balance is greater than 10,000,000\", \"Project Status = Exploration\". As the users learn their key data points, any field can be queried at any time!"
            },
            {
                "component": "Products",
                "section": "title4",
                "text_value": "Mouse Over Details"
            },
            {
                "component": "Products",
                "section": "content4",
                "text_value": "No matter where you are within the platform, there is mouseover text to help you understand the metrics and data being displayed. It may be something like a time period and the mouse over could indicate the share price for a range of companies, or it may be a pie chart showing project spend by a commodity type and the mouse over will show the company code and the spend amount.#Each element to the dashboard can provide more information just by hovering your mouse."
            },
            {
                "component": "Products",
                "section": "title5",
                "text_value": "Time Based Analysis"
            },
            {
                "component": "Products",
                "section": "content5",
                "text_value": "Drag and drop a time based chart to see the entire dashboard remodel itself based upon the new time period. It is as simple as going to a chart, dragging the time period and seeing everything update in real time.#It may be to better understand capital raises during a period, project spend over time or the change in market cap for a group of companies. This is a highly effective way of cutting through data quickly, to provide more timely and accurate information."
            },
            {
                "component": "Products",
                "section": "title6",
                "text_value": "Drop Down Selection"
            },
            {
                "component": "Products",
                "section": "content6",
                "text_value": "The dashboards allow users to select data from drop down points, such as ASX Codes, Commodity, High and Low Share price, and see the data filtered in real time.#Key prompts have been added throughout the platform for ease of use, so our clients can quickly pick up a dashboard and filter on key information they are looking for."
            },
            {
                "component": "NewsContent",
                "section": "card1_category",
                "text_value": "Mining Exploration"
            },
            {
                "component": "NewsContent",
                "section": "card1_date",
                "text_value": "March 12, 2025"
            },
            {
                "component": "NewsContent",
                "section": "card1_title",
                "text_value": "Lincoln Minerals' Eureka moment at Minbrie"
            },
            {
                "component": "NewsContent",
                "section": "card1_paragraphs",
                "text_value": "Lincoln Minerals has made a significant discovery at its Minbrie project on South Australia's Eyre Peninsula, with initial drilling results indicating strong potential for copper and rare earth elements.#The company's drilling program has intersected substantial mineralization, revealing a promising geological structure that could lead to a substantial mineral resource. This discovery comes after extensive exploration efforts in the region.#Lincoln Minerals' CEO expressed excitement about the findings, stating that this could be a \"game-changer\" for the company and potentially for Australia's rare earth elements supply chain."
            },
            {
                "component": "NewsContent",
                "section": "card1_link",
                "text_value": "https://mining.com.au/lincoln-minerals-eureka-moment-at-minbrie/"
            },
            {
                "component": "NewsContent",
                "section": "card2_category",
                "text_value": "Gold Mining"
            },
            {
                "component": "NewsContent",
                "section": "card2_date",
                "text_value": "March 15, 2025"
            },
            {
                "component": "NewsContent",
                "section": "card2_title",
                "text_value": "Metal Bank adds to Livingstone's gold resource supply"
            },
            {
                "component": "NewsContent",
                "section": "card2_paragraphs",
                "text_value": "Metal Bank Limited has announced a significant expansion to the gold resource at its Livingstone project, following an extensive drilling campaign that confirmed extensions to previously identified gold zones.#The updated mineral resource estimate shows a 34% increase in contained gold ounces, strengthening the economic viability of the project and positioning Metal Bank as an emerging player in Australia's gold sector.#Industry analysts suggest this resource upgrade could attract potential investors and partners as Metal Bank continues to advance the project toward development and production stages."
            },
            {
                "component": "NewsContent",
                "section": "card2_link",
                "text_value": "https://mining.com.au/metal-bank-adds-to-livingstones-gold-resource-supply/"
            },
            {
                "component": "NewsContent",
                "section": "card3_category",
                "text_value": "Coal Mining Technology"
            },
            {
                "component": "NewsContent",
                "section": "card3_date",
                "text_value": "March 16, 2025"
            },
            {
                "component": "NewsContent",
                "section": "card3_title",
                "text_value": "Vulcan South mine deploys Australian-first coal extraction tech"
            },
            {
                "component": "NewsContent",
                "section": "card3_paragraphs",
                "text_value": "The Vulcan South mine has become the first in Australia to implement a revolutionary coal extraction technology that promises to increase efficiency while significantly reducing environmental impact.#This innovative system, developed after years of research and testing, uses precision excavation techniques and real-time geological modeling to maximize resource recovery while minimizing waste material and energy consumption.#Industry experts are closely watching this deployment, as successful implementation could set new standards for sustainable mining practices across Australia's coal sector and potentially transform mining operations globally."
            },
            {
                "component": "NewsContent",
                "section": "card3_link",
                "text_value": "https://mining.com.au/vulcan-south-mine-deploys-australian-first-coal-extraction-tech/"
            },
            {
                "component": "Navbar",
                "section": "tab0",
                "text_value": '{"text": "Home", "link": "/", "showing": true, "accessLevel": -1}'
            },
            {
                "component": "Navbar",
                "section": "tab1",
                "text_value": '{"text": "Pricing", "link": "/pricing", "showing": true, "accessLevel": -1}'
            },
            {
                "component": "Navbar",
                "section": "tab2",
                "text_value": '{"text": "Products", "link": "/products", "showing": true, "accessLevel": -1}'
            },
            {
                "component": "Navbar",
                "section": "tab3",
                "text_value": '{"text": "Contact Us", "link": "/contact-us", "showing": true, "accessLevel": -1}'
            },
            {
                "component": "Navbar",
                "section": "tab4",
                "text_value": '{"text": "News", "link": "/news", "showing": true, "accessLevel": 0}'
            },
            {
                "component": "Navbar",
                "section": "tab5",
                "text_value": '{"text": "Socials", "link": "/social-media", "showing": true, "accessLevel": 0}'
            },
            {
                "component": "Navbar",
                "section": "graph0",
                "text_value": '{"text": "Company Details", "link": "/graphs/company-details", "showing": true, "accessLevel": 1}'
            },
            {
                "component": "Navbar",
                "section": "graph1",
                "text_value": '{"text": "Market Data", "link": "/graphs/market-data", "showing": true, "accessLevel": 1}'
            },
            {
                "component": "Navbar",
                "section": "graph2",
                "text_value": '{"text": "Market Trends", "link": "/graphs/market-trends", "showing": true, "accessLevel": 1}'
            },
            {
                "component": "Navbar",
                "section": "graph3",
                "text_value": '{"text": "Directors", "link": "/graphs/directors", "showing": true, "accessLevel": 1}'
            },
            {
                "component": "Navbar",
                "section": "graph4",
                "text_value": '{"text": "Shareholders", "link": "/graphs/shareholders", "showing": true, "accessLevel": 1}'
            },
            {
                "component": "Navbar",
                "section": "graph5",
                "text_value": '{"text": "Capital Raises", "link": "/graphs/capital-raises", "showing": true, "accessLevel": 1}'
            },
            {
                "component": "Navbar",
                "section": "graph6",
                "text_value": '{"text": "Projects", "link": "/graphs/projects", "showing": true, "accessLevel": 1}'
            },
            {
                "component": "Navbar",
                "section": "graph7",
                "text_value": '{"text": "Financials", "link": "/graphs/financials", "showing": true, "accessLevel": 1}'
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

    def create_news_cards(self):
        print("Seeding news cards...")
        
        NewsCard.objects.all().delete()
        
        news_cards_data = [
            {
                "order": 0,
                "category": "Mining Exploration",
                "date": "March 12, 2025",
                "title": "Lincoln Minerals' Eureka moment at Minbrie",
                "paragraphs": "Lincoln Minerals has made a significant discovery at its Minbrie project on South Australia's Eyre Peninsula, with initial drilling results indicating strong potential for copper and rare earth elements.#The company's drilling program has intersected substantial mineralization, revealing a promising geological structure that could lead to a substantial mineral resource. This discovery comes after extensive exploration efforts in the region.#Lincoln Minerals' CEO expressed excitement about the findings, stating that this could be a \"game-changer\" for the company and potentially for Australia's rare earth elements supply chain.",
                "link": "https://mining.com.au/lincoln-minerals-eureka-moment-at-minbrie/"
            },
            {
                "order": 1,
                "category": "Gold Mining",
                "date": "March 15, 2025",
                "title": "Metal Bank adds to Livingstone's gold resource supply",
                "paragraphs": "Metal Bank Limited has announced a significant expansion to the gold resource at its Livingstone project, following an extensive drilling campaign that confirmed extensions to previously identified gold zones.#The updated mineral resource estimate shows a 34% increase in contained gold ounces, strengthening the economic viability of the project and positioning Metal Bank as an emerging player in Australia's gold sector.#Industry analysts suggest this resource upgrade could attract potential investors and partners as Metal Bank continues to advance the project toward development and production stages.",
                "link": "https://mining.com.au/metal-bank-adds-to-livingstones-gold-resource-supply/"
            },
            {
                "order": 2,
                "category": "Coal Mining Technology",
                "date": "March 16, 2025",
                "title": "Vulcan South mine deploys Australian-first coal extraction tech",
                "paragraphs": "The Vulcan South mine has become the first in Australia to implement a revolutionary coal extraction technology that promises to increase efficiency while significantly reducing environmental impact.#This innovative system, developed after years of research and testing, uses precision excavation techniques and real-time geological modeling to maximize resource recovery while minimizing waste material and energy consumption.#Industry experts are closely watching this deployment, as successful implementation could set new standards for sustainable mining practices across Australia's coal sector and potentially transform mining operations globally.",
                "link": "https://mining.com.au/vulcan-south-mine-deploys-australian-first-coal-extraction-tech/"
            }
        ]
        
        for index, data in enumerate(news_cards_data):
            news_card = NewsCard(
                order=index,
                category=data["category"],
                date=data["date"],
                title=data["title"],
                paragraphs=data["paragraphs"],
                link=data["link"]
            )
            news_card.save()
            self.stdout.write(self.style.SUCCESS(f"Created news card: {news_card.title}"))
            
        self.stdout.write(self.style.SUCCESS("Successfully seeded news cards"))