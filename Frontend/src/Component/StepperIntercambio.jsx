import React from "react";
import "../styles/StepperIntercambio.css";

/**
 * Stepper de progreso para el intercambio de productos entre dos usuarios.
 * Props:
 *   steps: Array de pasos [{ label, icon, completed, active, userName }]
 *   onConfirm: función a ejecutar al confirmar (solo si es tu turno)
 *   canConfirm: booleano, si el usuario puede confirmar
 *   completed: booleano, si el intercambio está completado
 */
export default function StepperIntercambio({ steps, onConfirm, canConfirm, completed }) {
  return (
    <div className="stepper-intercambio-container">
      <div className="stepper-track">
        {steps.map((step, idx) => (
          <div key={idx} className={`stepper-step${step.completed ? " completed" : ""}${step.active ? " active" : ""}`}> 
            {/* Avatar o icono */}
            {step.avatarUrl ? (
              <a href={step.profileUrl} target="_blank" rel="noopener noreferrer" className="stepper-avatar-link">
                <img
                  src={step.avatarUrl}
                  alt={step.userName || step.label}
                  className="stepper-avatar"
                  onError={e => { e.target.src = '/images/fotoperfil.jpg'; }}
                />
              </a>
            ) : (
              <div className="stepper-icon">{step.icon}</div>
            )}
            <div className="stepper-label">{step.label}</div>
            {step.userName && <div className="stepper-user">{step.userName}</div>}
            {idx < steps.length - 1 && <div className="stepper-bar" />}
          </div>
        ))}
      </div>
      <div className="stepper-actions">
        {completed ? (
          <div className="stepper-success">¡Intercambio completado! 🎉</div>
        ) : canConfirm ? (
          <button className="stepper-confirm-btn" onClick={onConfirm}>
            Confirmar intercambio
          </button>
        ) : null}
      </div>
    </div>
  );
}

