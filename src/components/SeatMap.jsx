import { Check, X } from "lucide-react";

export default function SeatMap({
  bookedSeats = [],
  selectedSeats = [],
  onSeatToggle,
  maxSeats = 1,
  farePerSeat = 350
}) {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J"];

  return (
    <div
      id="ksrtc-seat-selection"
      className="seat-selection-container"
      role="region"
      aria-label="Interactive bus seat selection"
      data-lantern-step="8"
      data-lantern-action="choose-bus-seat"
      data-lantern-label="Bus seat selection"
    >
      <div className="seat-map-header">
        <h3 className="seat-map-title">Select Your Seat</h3>
        <p className="seat-map-instruction">
          Please select {maxSeats} seat{maxSeats > 1 ? "s" : ""} on the bus layout below.
        </p>

        {/* Legend */}
        <div className="seat-legend" aria-label="Seat status legend">
          <div className="legend-item">
            <span className="legend-box available" aria-hidden="true"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-box selected" aria-hidden="true">
              <Check size={12} />
            </span>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <span className="legend-box booked" aria-hidden="true">
              <X size={12} />
            </span>
            <span>Already Booked</span>
          </div>
        </div>
      </div>

      {/* Bus Shell Container */}
      <div className="bus-chassis">
        {/* Front cabin with steering indicator */}
        <div className="bus-front-cabin">
          <span className="front-label">FRONT / ENTRANCE</span>
          <div className="steering-wheel" title="Driver Cabin" aria-hidden="true">
            <div className="steering-icon">🚗 Driver</div>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="bus-seats-grid" role="grid" aria-label="Bus passenger seats">
          {rows.map((row) => (
            <div key={row} className="seat-row" role="row">
              <div className="row-label" aria-hidden="true">
                {row}
              </div>

              {/* Left pair (1, 2) */}
              <div className="seat-pair left-pair">
                {[1, 2].map((num) => {
                  const seatId = `${row}${num}`;
                  const isBooked = bookedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      disabled={isBooked}
                      className={`seat-btn ${
                        isBooked ? "seat-booked" : isSelected ? "seat-selected" : "seat-available"
                      }`}
                      onClick={() => onSeatToggle(seatId)}
                      aria-label={`Seat ${seatId}, ${
                        isBooked
                          ? "Already booked"
                          : isSelected
                          ? "Selected"
                          : `Available, Fare ₹${farePerSeat}`
                      }`}
                      data-lantern-step="8"
                      data-lantern-action="select-seat"
                      data-lantern-label={`Seat ${seatId}`}
                    >
                      <span className="seat-number">{seatId}</span>
                      {isSelected && <Check size={12} className="seat-check" aria-hidden="true" />}
                      {isBooked && <X size={12} className="seat-x" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              {/* Central Aisle */}
              <div className="seat-aisle" aria-hidden="true">
                <span>AISLE</span>
              </div>

              {/* Right pair (3, 4) */}
              <div className="seat-pair right-pair">
                {[3, 4].map((num) => {
                  const seatId = `${row}${num}`;
                  const isBooked = bookedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      disabled={isBooked}
                      className={`seat-btn ${
                        isBooked ? "seat-booked" : isSelected ? "seat-selected" : "seat-available"
                      }`}
                      onClick={() => onSeatToggle(seatId)}
                      aria-label={`Seat ${seatId}, ${
                        isBooked
                          ? "Already booked"
                          : isSelected
                          ? "Selected"
                          : `Available, Fare ₹${farePerSeat}`
                      }`}
                      data-lantern-step="8"
                      data-lantern-action="select-seat"
                      data-lantern-label={`Seat ${seatId}`}
                    >
                      <span className="seat-number">{seatId}</span>
                      {isSelected && <Check size={12} className="seat-check" aria-hidden="true" />}
                      {isBooked && <X size={12} className="seat-x" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="bus-rear">
          <span>REAR OF BUS</span>
        </div>
      </div>

      {/* Selection Status Summary */}
      <div className="seat-status-footer" aria-live="polite">
        <div className="status-col">
          <span className="status-label">Selected Seat(s):</span>
          <span className="status-val">
            {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None chosen yet"}
          </span>
        </div>

        <div className="status-col">
          <span className="status-label">Seat Price:</span>
          <span className="status-val">₹{selectedSeats.length * farePerSeat}</span>
        </div>
      </div>
    </div>
  );
}
