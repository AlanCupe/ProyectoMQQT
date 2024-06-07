import React from 'react';
import './EventCountCard.css';

const EventCountCard = ({ count }) => {
    return (
        <div className="event-count-card">
            <div className="iconContainer">
                <img src="/img/event-icon.png" alt="event-icon" />
            </div>
           <div className='countLabelContainer'>
           <div className="count">
             {count}
            </div>
            <div className="label">
                Total de Eventos
            </div>
           </div>
        </div>
    );
};

export default EventCountCard;