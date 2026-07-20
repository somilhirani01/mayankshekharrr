import { useEffect, useLayoutEffect, useRef, useState } from 'react';

function SlidingTabs({ tabs, activeId, onChange, ariaLabel = 'Sections' }) {
  const listRef = useRef(null);
  const btnRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const updateIndicator = () => {
    const activeBtn = btnRefs.current[activeId];
    const list = listRef.current;
    if (!activeBtn || !list) {
      return;
    }
    const listRect = list.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - listRect.left + list.scrollLeft,
      width: btnRect.width,
      ready: true,
    });
  };

  useLayoutEffect(() => {
    updateIndicator();
  }, [activeId, tabs]);

  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeId, tabs]);

  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel} ref={listRef}>
      <span
        className={`tab-indicator ${indicator.ready ? 'tab-indicator-ready' : ''}`}
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: `${indicator.width}px`,
        }}
        aria-hidden="true"
      />
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeId === item.id}
          className={`tab ${activeId === item.id ? 'tab-active' : ''}`}
          ref={(node) => {
            btnRefs.current[item.id] = node;
          }}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default SlidingTabs;
