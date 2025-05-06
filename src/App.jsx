import { useEffect, useState, useRef } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { getData, getSecondData } from "./fetch/getData.js";
import './App.css';

function DraggableCard({ item, index, onClick, flipped, onHover }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: index
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.25s ease',
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative',
    transformOrigin: 'center',
    cursor: 'grab',
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
    <div ref={setNodeRef} className="footer">
      <h3>Drop here</h3>
    </div>
  );
}

function App() {
  const hoverTimeoutRef = useRef(null);
  const [flippedCards, setFlippedCards] = useState([]);
  const [manga1, setManga1] = useState([]);
  const [manga2, setManga2] = useState([]);

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

  const handleDragEnd = (event) => {
    const { over, active } = event;
    if (over && over.id === 'footer-drop') {
      alert(`Card ${active.id} dropped in footer!`);
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
      }, 300);
    } else {
      body.style.backgroundImage = '';
      body.classList.remove('animated-bg');
    }
  };

  const allItems = [...manga1, ...manga2];

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <section className="layout">
        <div className="header">MangaBai</div>
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
    </DndContext>
  );
}

export default App;
