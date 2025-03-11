import React from 'react';
import filterVideo from '../assets/videos/1 Filter Visually on Charts.mp4';
import excludeDataVideo from '../assets/videos/2 Exclude Data using a legend.mp4';
import queryVideo from '../assets/videos/3 Query on any field.mp4';
import mouseOverVideo from '../assets/videos/4 mouseover intuitive.mp4';
import analysisVideo from '../assets/videos/5 Time Bases Analysis.mp4';
import dataBasedFilteringVideo from '../assets/videos/6 Data based filtering.mp4';
import '../styles/ProductsFeatures.css';
import '../styles/GeneralStyles.css';

const ProductsFeatures = () => {
    return (
      <div className="products-features-card standard-padding">
        <div className="products-features-wrapper">
          <div className="products-features-container">
            <div className="text-content">
              <h2 className="header-title">
                <strong>Visual Filtering</strong>
              </h2>
              <div className="space-y-4">
                <p>
                  Clicking on data changes everything you look at. As soon as you click through a piece of data, 
                  it filters the entire dashboard instantly and saves your filter at the top of the dashboard.
                </p>
                <p>
                  Remove any filters with a click. Each dashboard gives the user a full view of data, 
                  the user has the ability to filter the information simply by clicking data.
                </p>
                <p>
                  Any field within the dashboard can be filtered!
                </p>
              </div>
            </div>
            
            <div className="video-content">
              <video 
                src={filterVideo} 
                className="feature-video"
                autoPlay
                muted
                loop
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
  
          <div className="products-features-container reverse">
            <div className="video-content">
              <video 
                src={excludeDataVideo} 
                className="feature-video"
                autoPlay
                muted
                loop
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="text-content">
              <h2 className="header-title">
                <strong>Exclude Data</strong>
              </h2>
              <div className="space-y-4">
                <p>
                  Any data that complicates the dashboard or dominates metrics can be removed by selecting 
                  the record type and deselecting it, which will update all of the models within the dashboard instantly.
                </p>
                <p>
                  Users can filter through data to find key information with ease. Examples may be filtering out 
                  regions or areas where projects exist that may present risks for investment, or removing 
                  commodities that are not important to the user.
                </p>
              </div>
            </div>
          </div>
  
          <div className="products-features-container">
            <div className="text-content">
              <h2 className="header-title">
                <strong>Field Level Filtering</strong>
              </h2>
              <div className="space-y-4">
                <p>
                  Our platform comes with the ability to use a search bar to filter out data based upon any field 
                  within our database. Typing in a letter, like A would prompt the user for any of the fields 
                  in the database like "ASX Code" where the user can then select as specific ASX Code.
                </p>
                <p>
                  The applications for this are extremely powerful, like "Bank Balance is greater than 10,000,000", 
                  "Project Status = Exploration". As the users learn their key data points, any field 
                  can be queried at any time!
                </p>
              </div>
            </div>
            
            <div className="video-content">
              <video 
                src={queryVideo} 
                className="feature-video"
                autoPlay
                muted
                loop
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
  
          <div className="products-features-container reverse">
            <div className="video-content">
              <video 
                src={mouseOverVideo} 
                className="feature-video"
                autoPlay
                muted
                loop
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="text-content">
              <h2 className="header-title">
                <strong>Mouse Over Details</strong>
              </h2>
              <div className="space-y-4">
                <p>
                  No matter where you are within the platform, there is mouseover text to help you understand the metrics 
                  and data being displayed. It may be something like a time period and the mouse over could indicate 
                  the share price for a range of companies, or it may be a pie chart showing project spend by a 
                  commodity type and the mouse over will show the company code and the spend amount.
                </p>
                <p>
                  Each element to the dashboard can provide more information just by hovering your mouse.
                </p>
              </div>
            </div>
          </div>
  
          <div className="products-features-container">
            <div className="text-content">
              <h2 className="header-title">
                <strong>Time Based Analysis</strong>
              </h2>
              <div className="space-y-4">
                <p>
                  Drag and drop a time based chart to see the entire dashboard remodel itself based upon the new time period. 
                  It is as simple as going to a chart, dragging the time period and seeing everything update in real time.
                </p>
                <p>
                  It may be to better understand capital raises during a period, project spend over time or the change in 
                  market cap for a group of companies. This is a highly effective way of cutting through data quickly, 
                  to provide more timely and accurate information.
                </p>
              </div>
            </div>
            
            <div className="video-content">
              <video 
                src={analysisVideo} 
                className="feature-video"
                autoPlay
                muted
                loop
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
  
          <div className="products-features-container reverse">
            <div className="video-content">
              <video 
                src={dataBasedFilteringVideo} 
                className="feature-video"
                autoPlay
                muted
                loop
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="text-content">
              <h2 className="header-title">
                <strong>Drop Down Selection</strong>
              </h2>
              <div className="space-y-4">
                <p>
                  The dashboards allow users to select data from drop down points, such as ASX Codes, Commodity, 
                  High and Low Share price, and see the data filtered in real time.
                </p>
                <p>
                  Key prompts have been added throughout the platform for ease of use, so our clients can quickly 
                  pick up a dashboard and filter on key information they are looking for.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProductsFeatures;