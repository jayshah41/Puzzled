import React, { useState } from 'react';
import filterVideo from '../assets/videos/1 Filter Visually on Charts.mp4';
import ProductsFeaturesCard from './ProductsFeaturesCard';
import excludeDataVideo from '../assets/videos/2 Exclude Data using a legend.mp4';
import queryVideo from '../assets/videos/3 Query on any field.mp4';
import mouseOverVideo from '../assets/videos/4 mouseover intuitive.mp4';
import analysisVideo from '../assets/videos/5 Time Bases Analysis.mp4';
import dataBasedFilteringVideo from '../assets/videos/6 Data based filtering.mp4';
import '../styles/ProductsFeatures.css';
import '../styles/GeneralStyles.css';

const ProductsFeatures = () => {

  const [isEditing, setIsEditing] = useState(false);

  const [title1, setTitle1] = useState("Visual Filtering");
  const [content1, setContent1] = useState("Clicking on data changes everything you look at. As soon as you click through a piece of data, it filters the entire dashboard instantly and saves your filter at the top of the dashboard.#Remove any filters with a click. Each dashboard gives the user a full view of data, the user has the ability to filter the information simply by clicking data.#Any field within the dashboard can be filtered!");
  const [title2, setTitle2] = useState("Exclude Data");
  const [content2, setContent2] = useState("Any data that complicates the dashboard or dominates metrics can be removed by selecting the record type and deselecting it, which will update all of the models within the dashboard instantly.#Users can filter through data to find key information with ease. Examples may be filtering out regions or areas where projects exist that may present risks for investment, or removing commodities that are not important to the user.");
  const [title3, setTitle3] = useState("Field Level Filtering");
  const [content3, setContent3] = useState('Our platform comes with the ability to use a search bar to filter out data based upon any field within our database. Typing in a letter, like A would prompt the user for any of the fields in the database like "ASX Code" where the user can then select as specific ASX Code.#The applications for this are extremely powerful, like "Bank Balance is greater than 10,000,000", "Project Status = Exploration". As the users learn their key data points, any field can be queried at any time!');
  const [title4, setTitle4] = useState("Mouse Over Details");
  const [content4, setContent4] = useState("No matter where you are within the platform, there is mouseover text to help you understand the metrics and data being displayed. It may be something like a time period and the mouse over could indicate the share price for a range of companies, or it may be a pie chart showing project spend by a commodity type and the mouse over will show the company code and the spend amount.#Each element to the dashboard can provide more information just by hovering your mouse.");
  const [title5, setTitle5] = useState("Time Based Analysis");
  const [content5, setContent5] = useState("Drag and drop a time based chart to see the entire dashboard remodel itself based upon the new time period. It is as simple as going to a chart, dragging the time period and seeing everything update in real time.#It may be to better understand capital raises during a period, project spend over time or the change in market cap for a group of companies. This is a highly effective way of cutting through data quickly, to provide more timely and accurate information.");
  const [title6, setTitle6] = useState("Drop Down Selection");
  const [content6, setContent6] = useState("The dashboards allow users to select data from drop down points, such as ASX Codes, Commodity, High and Low Share price, and see the data filtered in real time.#Key prompts have been added throughout the platform for ease of use, so our clients can quickly pick up a dashboard and filter on key information they are looking for.");

    return (
      <div className="products-features-card standard-padding">
        <div className="products-features-wrapper">
          <ProductsFeaturesCard video={filterVideo} title={title1} content={content1} reverse={false} isEditing={isEditing} />
          <ProductsFeaturesCard video={excludeDataVideo} title={title2} content={content2} reverse={true} isEditing={isEditing} />
          <ProductsFeaturesCard video={queryVideo} title={title3} content={content3} reverse={false} isEditing={isEditing} />
          <ProductsFeaturesCard video={mouseOverVideo} title={title4} content={content4} reverse={true} isEditing={isEditing} />
          <ProductsFeaturesCard video={analysisVideo} title={title5} content={content5} reverse={false} isEditing={isEditing} />
          <ProductsFeaturesCard video={dataBasedFilteringVideo} title={title6} content={content6} reverse={true} isEditing={isEditing} />
        </div>
      </div>
    );
  };
  
  export default ProductsFeatures;