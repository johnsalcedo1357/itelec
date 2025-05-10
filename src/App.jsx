import { useEffect, useState, useRef, useReducer } from 'react';
import { DndContext, useDraggable, useDroppable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { getData, getSecondData } from "./fetch/getData.js";
import './App.css';

function DraggableCard({ item, index, onClick, flipped, onHover }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: index
  });

  const container = document.querySelector('.container');
  const cardWidth = 250;
  const cardsPerRow = Math.floor(container.offsetWidth / cardWidth);
  const cardPosition = index % cardsPerRow;
  const maxLeft = (cardPosition * cardWidth) * 2.5;
  const maxRight = ((cardsPerRow - cardPosition - 1) * cardWidth) + 200;

  const style = {
    transform: transform ? `translate(${Math.min(Math.max(transform.x, -maxLeft), maxRight)}px, ${transform.y}px)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.25s ease',
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative',
    transformOrigin: 'center',
    cursor: 'grab',
    touchAction: 'none',
    maxWidth: '100%'
  };

  return (
    <div
      ref={setNodeRef}
      className="cards"
      {...listeners}
      {...attributes}
      onContextMenu={(e) => {
        e.preventDefault();
        onClick(index);
      }}
      onMouseEnter={() => onHover(item.cover_picture)}
      onMouseLeave={() => onHover(null)}
      style={{
        ...style,
        transform: `${style.transform || ''} rotateY(${flipped ? 180 : 0}deg)`
      }}
    >
      <div className="card card-photo">
        <div className="card-tags">
         {item.tags.map((tag, i) => (
         <span key={i} className="tag">{tag}</span>
           ))}
        </div>
        <img src={item.picture} alt={item.title} title={item.title} />
        <h2>{item.title}</h2>
      </div>
      <div className="card card-text">
        <p>{item.description || 'No description available.'}</p>
      </div>
    </div>
  );
}

function FooterDropZone({ onDrop }) {
  const { setNodeRef } = useDroppable({ id: 'footer-drop' });
  return (
    <div className="footer">
      <div ref={setNodeRef} className='dropzone'>
      <p>Drop Your Items Here...</p>
      <div class="arrow-down"></div>
      </div>
    </div>
  );
}

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'RESET':
      return 0;
    default:
      return state;
  }
};

function App() {
  const hoverTimeoutRef = useRef(null);
  const [cartItems, setCartItems] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [manga1, setManga1] = useState([]);
  const [manga2, setManga2] = useState([]);
  const [isPushed, setIsPushed] = useState(false);
  const [notificationCount, dispatchNotification] = useReducer(notificationReducer, 0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    getData().then(data => setManga1(data));
    getSecondData().then(data => setManga2(data));
  }, []);

  const handleCardClick = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleDragStart = (event) => {
    if (event.active) {
      document.body.style.touchAction = 'none';
    }
  };

  const handleDragEnd = (event) => {
    const { over, active } = event;
    document.body.style.touchAction = '';
    if (over && over.id === 'footer-drop') {
      const droppedItem = allItems[active.id];
      
      setCartItems(prev => {
        const existingItemIndex = prev.findIndex(item => item.id === droppedItem.id);
        
        if (existingItemIndex !== -1) {
          return prev.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          );
        } else {
          return [...prev, { ...droppedItem, quantity: 1 }];
        }
      });
      
      dispatchNotification({ type: 'INCREMENT' });
    }
  };

  const handleCardHover = (coverPicture) => {
    const body = document.body;
    clearTimeout(hoverTimeoutRef.current);

    if (coverPicture) {
      hoverTimeoutRef.current = setTimeout(() => {
        body.style.backgroundImage = `url(${coverPicture})`;
        body.style.backgroundPosition = 'center';
        body.style.height = '210vh';
        body.classList.add('animated-bg');
      }, 50);
    } else {
      body.style.backgroundImage = '';
      body.classList.remove('animated-bg');
    }
  };

  const togglePush = () => {
    setIsPushed(prev => !prev);
    dispatchNotification({ type: 'RESET' });
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(prev => prev.filter((_, i) => i !== index));
    } else {
      setCartItems(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const allItems = [...manga1, ...manga2];

  return (
    <DndContext 
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <section className={`layout ${isPushed ? 'pushed' : ''}`}>
        <div className="header">
          <span className="logo">MangaBai</span>
          <button onClick={togglePush} className="toggle-button">
            {isPushed ? '✕' : '☰'}
            {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
          </button>
        </div>
        <div className="main">
          <div className="container">
            {allItems.map((item, index) => (
              <DraggableCard
                key={item.id || index}
                item={item}
                index={index}
                onClick={handleCardClick}
                flipped={flippedCards[index]}
                onHover={handleCardHover}
              />
            ))}
          </div>
        </div>
        <FooterDropZone />
      </section>
      
      <div className="sidebar-panel">
        <h2>Cart</h2>
        {cartItems.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          <>
            <ul>
              {cartItems.map((item, index) => (
                <li key={index}>
                  <div className="cart-item">
                    <span>{item.title}</span>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}>-</button>
                      <span>{item.quantity || 1}</span>
                      <button onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}>+</button>
                    </div>
                    <span>${item.price * (item.quantity || 1)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <p>Total: ${cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)}</p>
            </div>
          </>
        )}
      </div>
    </DndContext>
  );
}

export default App;
