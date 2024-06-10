import React from 'react';
import './EventCountCard.css';

const EventCountCard = ({ count, urlImg, description,area }) => {
    return (
        <div className="event-count-card">
            <div className="iconContainer">
                <img src={urlImg} alt="event-icon" />
            </div>
           <div className='countLabelContainer'>
           <div className="count">
             {count}
            </div>
            <div className="label">
                {description} <br/>
               <b>{area}</b> 
            </div>
           </div>
        </div>
    );
};

export default EventCountCard;