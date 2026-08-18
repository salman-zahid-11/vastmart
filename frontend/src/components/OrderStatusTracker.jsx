import './OrderStatusTracker.css';

const STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
];

function OrderStatusTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="status-tracker status-tracker--cancelled">
        <span className="status-tracker__cancelled-icon">✕</span>
        <span>This order was cancelled.</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="status-tracker">
      {STEPS.map((step, i) => {
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className={`status-tracker__step ${isDone ? 'status-tracker__step--done' : ''}`}>
            <div className="status-tracker__step-line-wrap">
              {i > 0 && <div className={`status-tracker__line ${i <= currentIndex ? 'status-tracker__line--done' : ''}`} />}
              <div className={`status-tracker__dot ${isCurrent ? 'status-tracker__dot--current' : ''}`}>
                {isDone && !isCurrent ? '✓' : ''}
              </div>
            </div>
            <span className="status-tracker__label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default OrderStatusTracker;