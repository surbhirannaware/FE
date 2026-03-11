import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import toast from "react-hot-toast";
import jwtDecode from "jwt-decode";

function Appointment() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  const role =
    decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    "";

  const isAdmin = role === "Admin";
  const isCustomer = role === "Customer";

  const getUserNameFromToken = () => {
    return (
      decoded?.fullName ||
      decoded?.name ||
      decoded?.unique_name ||
      decoded?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] ||
      decoded?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
      ] ||
      ""
    );
  };

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const [description, setDescription] = useState("");

  const [customerQuery, setCustomerQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeServicesResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const normalizeSlotsResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      try {
        const res = await fetch(
          "http://localhost:5007/api/services?page=1&pageSize=1000"
        );

        if (!res.ok) throw new Error("Failed to load services");

        const data = await res.json();
        const normalized = normalizeServicesResponse(data);
        setServices(normalized);
      } catch (err) {
        console.error("Failed to load services:", err);
        setServices([]);
        toast.error("Failed to load services");
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  useEffect(() => {
    if (!Array.isArray(services)) {
      setTotalAmount(0);
      setTotalDuration(0);
      return;
    }

    const selected = services.filter((s) =>
      selectedServices.includes(Number(s.serviceId))
    );

    const total = selected.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const duration = selected.reduce(
      (sum, s) => sum + (Number(s.durationMinutes) || 0),
      0
    );

    setTotalAmount(total);
    setTotalDuration(duration);
  }, [selectedServices, services]);

  useEffect(() => {
    const loadSlots = async () => {
      if (selectedServices.length === 0) {
        setAvailableSlots([]);
        setSelectedSlot(null);
        return;
      }

      setLoadingSlots(true);

      try {
        const query = selectedServices
          .map((id) => `serviceIds=${id}`)
          .join("&");

        const res = await fetch(
          `http://localhost:5007/api/availability/slots?date=${formatDate(
            selectedDate
          )}&${query}`
        );

        if (!res.ok) throw new Error("Failed to load slots");

        const data = await res.json();
        const normalizedSlots = normalizeSlotsResponse(data);

        setAvailableSlots(normalizedSlots);

        if (
          selectedSlot &&
          !normalizedSlots.some((slot) => slot.startTime === selectedSlot)
        ) {
          setSelectedSlot(null);
        }
      } catch (err) {
        console.error("Failed to load slots:", err);
        setAvailableSlots([]);
        setSelectedSlot(null);
        toast.error("Failed to load available slots");
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate, selectedServices, selectedSlot]);

  const searchCustomer = async (value) => {
    setCustomerQuery(value);
    setSelectedCustomerId(null);

    if (!isAdmin || isNewCustomer) {
      setCustomers([]);
      return;
    }

    if (value.trim().length < 1) {
      setCustomers([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5007/api/admin/customers/search?term=${encodeURIComponent(
          value
        )}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) {
        setCustomers([]);
        return;
      }

      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Customer search failed:", err);
      setCustomers([]);
    }
  };

  const isPastTime = (time) => {
    if (!time) return false;

    const now = new Date();
    const slotDate = new Date(selectedDate);

    const parts = time.split(":");
    const hours = Number(parts[0] || 0);
    const minutes = Number(parts[1] || 0);

    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate < now;
  };

  const calculateEndTime = () => {
    if (!selectedSlot || !totalDuration) return "";

    const parts = selectedSlot.split(":");
    const hours = Number(parts[0] || 0);
    const minutes = Number(parts[1] || 0);

    const start = new Date(selectedDate);
    start.setHours(hours, minutes, 0, 0);
    start.setMinutes(start.getMinutes() + totalDuration);

    return start.toTimeString().slice(0, 5);
  };

  const handleServiceChange = (serviceId, checked) => {
    setSelectedServices((prev) => {
      if (checked) {
        if (prev.includes(serviceId)) return prev;
        return [...prev, serviceId];
      }
      return prev.filter((id) => id !== serviceId);
    });
  };

  const validateForm = () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return false;
    }

    if (!selectedSlot) {
      toast.error("Please select time slot");
      return false;
    }

    if (isAdmin) {
      if (!customerQuery.trim()) {
        toast.error("Customer name is required");
        return false;
      }

      if (!isNewCustomer && !selectedCustomerId) {
        toast.error("Please select existing customer from suggestions");
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setSelectedServices([]);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setDescription("");
    setCustomerQuery("");
    setCustomers([]);
    setSelectedCustomerId(null);
    setIsNewCustomer(false);
    setTotalAmount(0);
    setTotalDuration(0);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        serviceIds: selectedServices,
        appointmentDate: formatDate(selectedDate),
        startTime: `${selectedSlot}:00`,
        customerId: isAdmin && !isNewCustomer ? selectedCustomerId : null,
        customerName: isAdmin ? customerQuery.trim() : getUserNameFromToken(),
        isNewCustomer: isAdmin ? isNewCustomer : false,
        description: description.trim() || null,
      };

      const endpoint = "http://localhost:5007/api/appointments";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error(errorText || "Booking failed");
        return;
      }

      await res.json();
      toast.success("Appointment booked successfully");

      resetForm();

      navigate(isAdmin ? "/dashboard" : "/customer/dashboard", {
        state: {
          refresh: true,
          selectedDate: formatDate(selectedDate),
        },
      });
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Book Appointment</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin
                ? "Create appointment for a customer"
                : isCustomer
                  ? "Book your salon appointment"
                  : "Create a new appointment"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {isAdmin && (
              <div className="relative">
                <label className="text-sm font-medium block">
                  Customer Details
                </label>

                <label className="flex items-center gap-2 mt-3 text-sm">
                  <input
                    type="checkbox"
                    checked={isNewCustomer}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsNewCustomer(checked);
                      setCustomerQuery("");
                      setCustomers([]);
                      setSelectedCustomerId(null);
                    }}
                  />
                  New Customer
                </label>

                <input
                  type="text"
                  value={customerQuery}
                  onChange={(e) => searchCustomer(e.target.value)}
                  className="w-full mt-3 px-4 py-3 border rounded-lg bg-white text-slate-900"
                  placeholder={
                    isNewCustomer
                      ? "Enter new customer name"
                      : "Search existing customer"
                  }
                />

                {!isNewCustomer && customers.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto rounded-lg border bg-white shadow">
                    {customers.map((c) => (
                      <div
                        key={c.customerId}
                        onClick={() => {
                          setCustomerQuery(c.name);
                          setSelectedCustomerId(c.customerId);
                          setCustomers([]);
                        }}
                        className="cursor-pointer border-b px-4 py-3 hover:bg-gray-100 last:border-b-0"
                      >
                        <p className="text-sm font-medium text-slate-800">
                          {c.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {!isNewCustomer &&
                  customerQuery.trim().length > 0 &&
                  customers.length === 0 &&
                  !selectedCustomerId && (
                    <p className="mt-2 text-xs text-slate-500">
                      No existing customer found
                    </p>
                  )}

                {!isNewCustomer && selectedCustomerId && (
                  <p className="mt-2 text-xs text-green-600">
                    Existing customer selected
                  </p>
                )}
              </div>
            )}

            {isCustomer && (
              <div className="rounded-lg border bg-blue-50 px-4 py-3 text-sm text-slate-700">
                Booking for:{" "}
                <span className="font-semibold">
                  {getUserNameFromToken() || "Customer"}
                </span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium block">Select Date</label>

              <div className="mt-2">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  minDate={today}
                  maxDate={maxDate}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block">
                Select Services
              </label>

              {loadingServices ? (
                <p className="mt-3 text-sm text-slate-500">
                  Loading services...
                </p>
              ) : !Array.isArray(services) || services.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No services available
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 mt-2 md:grid-cols-2">
                  {services.map((service) => (
                    <label
                      key={service.serviceId}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border bg-slate-50 p-3"
                    >
                      <input
                        type="checkbox"
                        value={service.serviceId}
                        checked={selectedServices.includes(
                          Number(service.serviceId)
                        )}
                        onChange={(e) =>
                          handleServiceChange(
                            Number(e.target.value),
                            e.target.checked
                          )
                        }
                        className="mt-1"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          {service.serviceName}
                        </p>
                        <p className="text-xs text-slate-500">
                          ₹{service.price} • {service.durationMinutes} mins
                        </p>
                        {service.categoryName && (
                          <p className="mt-1 text-[11px] text-slate-400">
                            {service.categoryName}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium block">
                Available Time Slots
              </label>

              {loadingSlots ? (
                <p className="mt-3 text-sm text-slate-500">Loading slots...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-3 md:grid-cols-3">
                  {availableSlots.length === 0 && (
                    <p className="col-span-3 text-sm text-gray-500">
                      {selectedServices.length === 0
                        ? "Select services to see slots"
                        : "No slots available"}
                    </p>
                  )}

                  {availableSlots.map((slot, index) => {
                    const startTime = slot.startTime;
                    const endTime = slot.endTime || calculateEndTime();
                    const disabled = isPastTime(startTime);

                    return (
                      <button
                        key={`${startTime}-${index}`}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedSlot(startTime)}
                        className={`rounded-lg border px-2 py-2 text-sm font-medium transition
                          ${selectedSlot === startTime
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "bg-white text-slate-700"
                          }
                          ${disabled
                            ? "cursor-not-allowed opacity-40"
                            : "hover:bg-blue-50"
                          }`}
                      >
                        {startTime} - {endTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900">
              <h3 className="mb-3 font-semibold">Booking Summary</h3>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(selectedDate)}
                </p>
                <p>
                  <span className="font-medium">Services:</span>{" "}
                  {selectedServices.length}
                </p>
                <p>
                  <span className="font-medium">Duration:</span> {totalDuration}{" "}
                  mins
                </p>
                <p>
                  <span className="font-medium">Start Time:</span>{" "}
                  {selectedSlot || "--"}
                </p>
                <p>
                  <span className="font-medium">End Time:</span>{" "}
                  {calculateEndTime() || "--"}
                </p>
                <p className="mt-2 text-lg font-bold">Total: ₹{totalAmount}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block">Description</label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="mt-2 w-full rounded-lg border px-4 py-3"
                placeholder="Add notes for this appointment"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full rounded-lg py-3 font-semibold text-white ${submitting
                  ? "cursor-not-allowed bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointment;