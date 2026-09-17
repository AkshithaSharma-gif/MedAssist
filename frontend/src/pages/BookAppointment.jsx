// import { useEffect, useState } from "react";
// import {
//   CalendarDays,
//   Clock3,
//   Stethoscope,
//   Building2,
//   ClipboardList,
//   FileText,
//   CheckCircle2,
//   AlertCircle,
//   Loader2,
// } from "lucide-react";
// import api from "../services/api";

// function BookAppointment() {
//   const [departments, setDepartments] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [services, setServices] = useState([]);

//   const [formData, setFormData] = useState({
//     departmentId: "",
//     doctorId: "",
//     serviceId: "",
//     appointmentDate: "",
//     startTime: "",
//     reason: "",
//   });

//   const [loading, setLoading] = useState(true);
//   const [booking, setBooking] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [departmentRes, doctorRes, serviceRes] =
//           await Promise.all([
//             api.get("/departments"),
//             api.get("/doctors"),
//             api.get("/services"),
//           ]);

//         setDepartments(
//           departmentRes.data.departments ||
//             departmentRes.data.data ||
//             []
//         );

//         setDoctors(
//           doctorRes.data.doctors ||
//             doctorRes.data.data ||
//             []
//         );

//         setServices(
//           serviceRes.data.services ||
//             serviceRes.data.data ||
//             []
//         );
//       } catch (err) {
//         console.error(err);

//         setError(
//           err.response?.data?.message ||
//             "Failed to load appointment data"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });

//     setMessage("");
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setMessage("");
//     setError("");
//     setBooking(true);

//     try {
//       const response = await api.post(
//         "/appointments",
//         formData
//       );

//       setMessage(
//         response.data.message ||
//           "Appointment booked successfully!"
//       );

//       setFormData({
//         departmentId: "",
//         doctorId: "",
//         serviceId: "",
//         appointmentDate: "",
//         startTime: "",
//         reason: "",
//       });
//     } catch (err) {
//       console.error(err);

//       setError(
//         err.response?.data?.message ||
//           "Failed to book appointment"
//       );
//     } finally {
//       setBooking(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <div className="text-center">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
//             <Loader2
//               size={28}
//               className="animate-spin text-blue-600"
//             />
//           </div>

//           <p className="mt-4 text-sm font-medium text-slate-600">
//             Loading appointment options...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-5xl space-y-6 pb-8">

//       {/* HEADER */}
//       <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
//         <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
//         <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-cyan-300/10" />

//         <div className="relative z-10 flex items-start gap-4">
//           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
//             <CalendarDays size={25} />
//           </div>

//           <div>
//             <p className="text-sm font-medium text-blue-100">
//               Patient Services
//             </p>

//             <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
//               Book an Appointment
//             </h1>

//             <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
//               Schedule a consultation with a doctor at a
//               convenient date and time.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* SUCCESS MESSAGE */}
//       {message && (
//         <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
//           <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
//             <CheckCircle2 size={20} />
//           </div>

//           <div>
//             <p className="font-semibold text-emerald-800">
//               Appointment Confirmed
//             </p>

//             <p className="mt-1 text-sm text-emerald-700">
//               {message}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* ERROR MESSAGE */}
//       {error && (
//         <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
//           <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
//             <AlertCircle size={20} />
//           </div>

//           <div>
//             <p className="font-semibold text-red-800">
//               Unable to Book Appointment
//             </p>

//             <p className="mt-1 text-sm text-red-700">
//               {error}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* FORM */}
//       <form
//         onSubmit={handleSubmit}
//         className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
//       >

//         {/* BASIC INFORMATION */}
//         <div className="border-b border-slate-100 p-6 sm:p-8">
//           <div className="mb-6">
//             <h2 className="text-lg font-bold text-slate-900">
//               Appointment Details
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Choose the department, doctor, and service for
//               your visit.
//             </p>
//           </div>

//           <div className="grid gap-5 md:grid-cols-2">

//             {/* DEPARTMENT */}
//             <div>
//               <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//                 <Building2 size={17} className="text-blue-600" />
//                 Department
//               </label>

//               <select
//                 name="departmentId"
//                 value={formData.departmentId}
//                 onChange={handleChange}
//                 required
//                 className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
//               >
//                 <option value="">
//                   Select Department
//                 </option>

//                 {departments.map((department) => (
//                   <option
//                     key={department._id}
//                     value={department._id}
//                   >
//                     {department.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* DOCTOR */}
//             <div>
//               <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//                 <Stethoscope size={17} className="text-violet-600" />
//                 Doctor
//               </label>

//               <select
//                 name="doctorId"
//                 value={formData.doctorId}
//                 onChange={handleChange}
//                 required
//                 className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
//               >
//                 <option value="">
//                   Select Doctor
//                 </option>

//                 {doctors.map((doctor) => (
//                   <option
//                     key={doctor._id}
//                     value={doctor._id}
//                   >
//                     {doctor.userId?.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* SERVICE */}
//             <div className="md:col-span-2">
//               <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//                 <ClipboardList size={17} className="text-cyan-600" />
//                 Service
//               </label>

//               <select
//                 name="serviceId"
//                 value={formData.serviceId}
//                 onChange={handleChange}
//                 required
//                 className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
//               >
//                 <option value="">
//                   Select Service
//                 </option>

//                 {services.map((service) => (
//                   <option
//                     key={service._id}
//                     value={service._id}
//                   >
//                     {service.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* DATE & TIME */}
//         <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
//           <div className="mb-6">
//             <h2 className="text-lg font-bold text-slate-900">
//               Date & Time
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Select when you would like to visit the doctor.
//             </p>
//           </div>

//           <div className="grid gap-5 md:grid-cols-2">

//             {/* DATE */}
//             <div>
//               <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//                 <CalendarDays
//                   size={17}
//                   className="text-blue-600"
//                 />
//                 Appointment Date
//               </label>

//               <input
//                 type="date"
//                 name="appointmentDate"
//                 value={formData.appointmentDate}
//                 onChange={handleChange}
//                 required
//                 className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//               />
//             </div>

//             {/* TIME */}
//             <div>
//               <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//                 <Clock3
//                   size={17}
//                   className="text-cyan-600"
//                 />
//                 Start Time
//               </label>

//               <input
//                 type="time"
//                 name="startTime"
//                 value={formData.startTime}
//                 onChange={handleChange}
//                 required
//                 className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
//               />
//             </div>
//           </div>
//         </div>

//         {/* REASON */}
//         <div className="p-6 sm:p-8">
//           <div className="mb-5">
//             <h2 className="text-lg font-bold text-slate-900">
//               Additional Information
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Tell the doctor briefly why you are scheduling
//               this appointment.
//             </p>
//           </div>

//           <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
//             <FileText size={17} className="text-amber-600" />
//             Reason for Visit
//           </label>

//           <textarea
//             name="reason"
//             value={formData.reason}
//             onChange={handleChange}
//             placeholder="Enter reason for appointment..."
//             rows="4"
//             className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
//           />

//           {/* SUBMIT */}
//           <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-xs text-slate-500">
//               Please select a time within the doctor's
//               availability.
//             </p>

//             <button
//               type="submit"
//               disabled={booking}
//               className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {booking ? (
//                 <>
//                   <Loader2
//                     size={18}
//                     className="animate-spin"
//                   />
//                   Booking...
//                 </>
//               ) : (
//                 <>
//                   <CalendarDays size={18} />
//                   Book Appointment
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default BookAppointment;







import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Stethoscope,
  Building2,
  ClipboardList,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  UserRound,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function BookAppointment() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  const [bookedAppointments, setBookedAppointments] = useState([]);
const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [formData, setFormData] = useState({
    departmentId: "",
    doctorId: "",
    serviceId: "",
    appointmentDate: "",
    startTime: "",
    reason: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentRes, doctorRes, serviceRes] =
          await Promise.all([
            api.get("/departments"),
            api.get("/doctors"),
            api.get("/services"),
          ]);

        setDepartments(
          departmentRes.data.departments ||
            departmentRes.data.data ||
            []
        );

        setDoctors(
          doctorRes.data.doctors ||
            doctorRes.data.data ||
            []
        );

        setServices(
          serviceRes.data.services ||
            serviceRes.data.data ||
            []
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load appointment data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
  const loadBookedAppointments = async () => {
    if (
      !formData.doctorId ||
      !formData.appointmentDate
    ) {
      setBookedAppointments([]);
      return;
    }

    setAvailabilityLoading(true);

    try {
      const response = await api.get(
        "/appointments/availability",
        {
          params: {
            doctorId: formData.doctorId,
            appointmentDate:
              formData.appointmentDate,
          },
        }
      );

      setBookedAppointments(
        response.data.appointments || []
      );
    } catch (err) {
      console.error(err);

      setBookedAppointments([]);

      setError(
        err.response?.data?.message ||
          "Failed to load available time slots"
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  loadBookedAppointments();
}, [
  formData.doctorId,
  formData.appointmentDate,
]);

  const selectedDepartment = departments.find(
    (department) =>
      department._id === formData.departmentId
  );

  const selectedDoctor = doctors.find(
    (doctor) => doctor._id === formData.doctorId
  );

  const selectedService = services.find(
    (service) => service._id === formData.serviceId
  );

  // Only doctors belonging to the selected department
  const filteredDoctors = useMemo(() => {
    if (!formData.departmentId) {
      return [];
    }

    return doctors.filter(
      (doctor) =>
        doctor.departmentId?._id ===
          formData.departmentId ||
        doctor.departmentId === formData.departmentId
    );
  }, [doctors, formData.departmentId]);

  // Only services belonging to the selected department
  const filteredServices = useMemo(() => {
    if (!formData.departmentId) {
      return [];
    }

    return services.filter(
      (service) =>
        service.departmentId?._id ===
          formData.departmentId ||
        service.departmentId === formData.departmentId
    );
  }, [services, formData.departmentId]);

  // Doctor's available days
  const availableDays = useMemo(() => {
    if (!selectedDoctor?.availability) {
      return [];
    }

    return selectedDoctor.availability.filter(
      (availability) => availability.isAvailable
    );
  }, [selectedDoctor]);

  const availableDayNames = useMemo(() => {
    return availableDays.map((item) =>
      item.day.toLowerCase()
    );
  }, [availableDays]);

  // Get availability for selected date
  const selectedDateAvailability = useMemo(() => {
    if (!formData.appointmentDate) {
      return null;
    }

    const date = new Date(
      `${formData.appointmentDate}T00:00:00`
    );

    const dayName = date
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase();

    return (
      availableDays.find(
        (item) => item.day.toLowerCase() === dayName
      ) || null
    );
  }, [
    formData.appointmentDate,
    availableDays,
  ]);

  // Generate time slots based on doctor's availability
  // and selected service duration
  // const timeSlots = useMemo(() => {
  //   if (
  //     !selectedDateAvailability ||
  //     !selectedService
  //   ) {
  //     return [];
  //   }

  //   const start = selectedDateAvailability.startTime;
  //   const end = selectedDateAvailability.endTime;

  //   const duration = Number(
  //     selectedService.duration || 30
  //   );


  const timeSlots = useMemo(() => {
  if (!selectedDateAvailability) {
    return [];
  }

  const start = selectedDateAvailability.startTime;
  const end = selectedDateAvailability.endTime;

  const duration = Number(
    selectedService?.duration || 30
  );

  if (!duration || duration <= 0) {
    return [];
  }

  const [startHour, startMinute] = start
    .split(":")
    .map(Number);

  const [endHour, endMinute] = end
    .split(":")
    .map(Number);

  let currentMinutes =
    startHour * 60 + startMinute;

  const endMinutes =
    endHour * 60 + endMinute;

  const slots = [];

  const timeToMinutes = (time) => {
    const [hour, minute] = time
      .split(":")
      .map(Number);

    return hour * 60 + minute;
  };

  while (
    currentMinutes + duration <=
    endMinutes
  ) {
    const slotStart = currentMinutes;
    const slotEnd =
      currentMinutes + duration;

    const isBooked = bookedAppointments.some(
      (appointment) => {
        const bookedStart = timeToMinutes(
          appointment.startTime
        );

        const bookedEnd = timeToMinutes(
          appointment.endTime
        );

        return (
          slotStart < bookedEnd &&
          slotEnd > bookedStart
        );
      }
    );

    if (!isBooked) {
      const hour = Math.floor(
        currentMinutes / 60
      );

      const minute =
        currentMinutes % 60;

      const time = `${String(hour).padStart(
        2,
        "0"
      )}:${String(minute).padStart(2, "0")}`;

      slots.push(time);
    }

    currentMinutes += duration;
  }

  return slots;
}, [
  selectedDateAvailability,
  selectedService,
  bookedAppointments,
]);

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;

    setFormData({
      departmentId,
      doctorId: "",
      serviceId: "",
      appointmentDate: "",
      startTime: "",
      reason: "",
    });

    setStep(1);
    setMessage("");
    setError("");
  };

  const handleDoctorChange = (e) => {
    setFormData({
      ...formData,
      doctorId: e.target.value,
      appointmentDate: "",
      startTime: "",
    });

    setMessage("");
    setError("");
  };

  const handleServiceChange = (e) => {
  setFormData({
    ...formData,
    serviceId: e.target.value,
  });

  setMessage("");
  setError("");
};

  const handleDateChange = (e) => {
    const dateValue = e.target.value;

    if (!dateValue) {
      setFormData({
        ...formData,
        appointmentDate: "",
        startTime: "",
      });

      return;
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    );

    const dayName = date
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase();

    const isAvailable =
      availableDayNames.includes(dayName);

    if (!isAvailable) {
      setError(
        `The selected doctor is not available on ${dayName}. Please choose another date.`
      );

      setFormData({
        ...formData,
        appointmentDate: "",
        startTime: "",
      });

      return;
    }

    setFormData({
      ...formData,
      appointmentDate: dateValue,
      startTime: "",
    });

    setError("");
    setMessage("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const goToNextStep = () => {
    setError("");

    if (step === 1) {
      if (!formData.departmentId) {
        setError(
          "Please select a department."
        );
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.doctorId) {
        setError(
          "Please select a doctor."
        );
        return;
      }

      if (availableDays.length === 0) {
        setError(
          "This doctor currently has no available days."
        );
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      if (!formData.appointmentDate) {
        setError(
          "Please select an available date."
        );
        return;
      }

      if (!formData.startTime) {
        setError(
          "Please select an available time slot."
        );
        return;
      }

      setStep(4);
      return;
    }

    if (step === 4) {
      if (!formData.serviceId) {
        setError(
          "Please select a service."
        );
        return;
      }

      setStep(5);
    }
  };

  const goToPreviousStep = () => {
    setError("");

    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setBooking(true);

    try {
      const response = await api.post(
        "/appointments",
        formData
      );

      setMessage(
        response.data.message ||
          "Appointment booked successfully!"
      );

      setTimeout(() => {
        navigate(
          "/patient/my-appointments"
        );
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to book appointment"
      );
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hour, minute] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hour),
      Number(minute),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const stepLabels = [
    "Department",
    "Doctor",
    "Date & Time",
    "Service",
    "Confirm",
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Loader2
              size={28}
              className="animate-spin text-blue-600"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading appointment options...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">

      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />

        <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-cyan-300/10" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <CalendarDays size={25} />
          </div>

          <div>
            <p className="text-sm font-medium text-blue-100">
              Patient Services
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Book an Appointment
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
              Schedule a consultation with a doctor at a
              convenient date and time.
            </p>
          </div>
        </div>
      </section>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <p className="font-semibold text-emerald-800">
              Appointment Confirmed
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              {message}
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              Redirecting to your appointments...
            </p>
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle size={20} />
          </div>

          <div>
            <p className="font-semibold text-red-800">
              Unable to Continue
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* PROGRESS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {stepLabels.map(
            (label, index) => {
              const stepNumber =
                index + 1;

              const completed =
                stepNumber < step;

              const active =
                stepNumber === step;

              return (
                <div
                  key={label}
                  className="flex min-w-max flex-1 items-center"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                        completed
                          ? "bg-emerald-500 text-white"
                          : active
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2
                          size={18}
                        />
                      ) : (
                        stepNumber
                      )}
                    </div>

                    <span
                      className={`hidden text-xs font-semibold sm:block ${
                        active
                          ? "text-blue-700"
                          : completed
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  {index <
                    stepLabels.length -
                      1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        completed
                          ? "bg-emerald-400"
                          : "bg-slate-100"
                      }`}
                    />
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >

        {/* STEP 1 — DEPARTMENT */}
        {step === 1 && (
          <div className="p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Building2 size={22} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Choose a Department
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the department for your
                consultation.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {departments.map(
                (department) => {
                  const selected =
                    formData.departmentId ===
                    department._id;

                  return (
                    <button
                      type="button"
                      key={department._id}
                      onClick={() =>
                        handleDepartmentChange({
                          target: {
                            value:
                              department._id,
                          },
                        })
                      }
                      className={`rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                          <Building2
                            size={21}
                          />
                        </div>

                        {selected && (
                          <CheckCircle2
                            size={20}
                            className="text-blue-600"
                          />
                        )}
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-900">
                        {department.name}
                      </h3>

                      {department.description && (
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {
                            department.description
                          }
                        </p>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-7 flex justify-end border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — DOCTOR */}
        {step === 2 && (
          <div className="p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Stethoscope size={22} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Choose Your Doctor
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Doctors available in{" "}
                <span className="font-semibold text-blue-600">
                  {selectedDepartment?.name}
                </span>
                .
              </p>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                <Stethoscope
                  size={30}
                  className="mx-auto text-amber-600"
                />

                <p className="mt-3 font-semibold text-amber-800">
                  No doctors available
                </p>

                <p className="mt-1 text-sm text-amber-700">
                  There are currently no doctors
                  in this department.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredDoctors.map(
                  (doctor) => {
                    const selected =
                      formData.doctorId ===
                      doctor._id;

                    const available =
                      doctor.availability?.filter(
                        (item) =>
                          item.isAvailable
                      ) || [];

                    return (
                      <button
                        type="button"
                        key={doctor._id}
                        onClick={() =>
                          handleDoctorChange({
                            target: {
                              value:
                                doctor._id,
                            },
                          })
                        }
                        className={`rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-violet-500 bg-violet-50 ring-4 ring-violet-100"
                            : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                            <UserRound
                              size={23}
                            />
                          </div>

                          {selected && (
                            <CheckCircle2
                              size={20}
                              className="text-violet-600"
                            />
                          )}
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          {doctor.userId?.name ||
                            "Doctor"}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-violet-600">
                          {
                            doctor.specialization
                          }
                        </p>

                        {doctor.qualification && (
                          <p className="mt-1 text-sm text-slate-500">
                            {
                              doctor.qualification
                            }
                          </p>
                        )}

                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Available
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {available.length >
                            0 ? (
                              available.map(
                                (
                                  item
                                ) => (
                                  <span
                                    key={
                                      item._id
                                    }
                                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700"
                                  >
                                    {
                                      item.day
                                    }
                                  </span>
                                )
                              )
                            ) : (
                              <span className="text-xs text-red-500">
                                No availability
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — DATE & TIME */}
        {step === 3 && (
          <div className="p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                <CalendarDays size={22} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Choose Date & Time
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a date and time from{" "}
                <span className="font-semibold text-blue-600">
                  {selectedDoctor?.userId
                    ?.name || "your doctor"}
                </span>
                's availability.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="flex items-start gap-3">
                <Clock3
                  size={20}
                  className="mt-0.5 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Doctor's Availability
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableDays.map(
                      (item) => (
                        <span
                          key={item._id}
                          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold capitalize text-blue-700 shadow-sm"
                        >
                          {item.day}{" "}
                          {formatTime(
                            item.startTime
                          )}{" "}
                          –{" "}
                          {formatTime(
                            item.endTime
                          )}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDays
                    size={17}
                    className="text-blue-600"
                  />
                  Appointment Date
                </label>

                <input
                  type="date"
                  name="appointmentDate"
                  value={
                    formData.appointmentDate
                  }
                  min={getToday()}
                  onChange={
                    handleDateChange
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Available days are shown above.
                </p>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock3
                    size={17}
                    className="text-cyan-600"
                  />
                  Available Time
                </label>

                {!formData.appointmentDate ? (
                  <div className="flex min-h-[48px] items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-400">
                    Select a date first
                  </div>
                ) : timeSlots.length ===
                  0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    No time slots available
                    for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {timeSlots.map(
                      (time) => {
                        const selected =
                          formData.startTime ===
                          time;

                        return (
                          <button
                            type="button"
                            key={time}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                startTime:
                                  time,
                              });

                              setError("");
                            }}
                            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                              selected
                                ? "border-cyan-500 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-100"
                                : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50"
                            }`}
                          >
                            {formatTime(
                              time
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedDateAvailability &&
              formData.appointmentDate && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Selected date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(
                      formData.appointmentDate
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Doctor available from{" "}
                    {formatTime(
                      selectedDateAvailability.startTime
                    )}{" "}
                    to{" "}
                    {formatTime(
                      selectedDateAvailability.endTime
                    )}
                  </p>
                </div>
              )}

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — SERVICE + REASON */}
        {step === 4 && (
          <div className="p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                <ClipboardList size={22} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Choose a Service
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the service you need for
                this appointment.
              </p>
            </div>

            {filteredServices.length ===
            0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                <ClipboardList
                  size={30}
                  className="mx-auto text-amber-600"
                />

                <p className="mt-3 font-semibold text-amber-800">
                  No services available
                </p>

                <p className="mt-1 text-sm text-amber-700">
                  There are currently no services
                  for this department.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredServices.map(
                  (service) => {
                    const selected =
                      formData.serviceId ===
                      service._id;

                    return (
                      <button
                        type="button"
                        key={service._id}
                        onClick={() =>
                          handleServiceChange({
                            target: {
                              value:
                                service._id,
                            },
                          })
                        }
                        className={`rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-cyan-500 bg-cyan-50 ring-4 ring-cyan-100"
                            : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                            <ClipboardList
                              size={21}
                            />
                          </div>

                          {selected && (
                            <CheckCircle2
                              size={20}
                              className="text-cyan-600"
                            />
                          )}
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          {service.name}
                        </h3>

                        {service.description && (
                          <p className="mt-1 text-sm leading-5 text-slate-500">
                            {
                              service.description
                            }
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            <Clock3
                              size={13}
                            />
                            {
                              service.duration
                            }{" "}
                            min
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <IndianRupee
                              size={13}
                            />
                            {
                              service.price
                            }
                          </span>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}

            <div className="mt-7">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText
                  size={17}
                  className="text-amber-600"
                />
                Reason for Visit
              </label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for appointment..."
                rows="4"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Review Appointment
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — CONFIRMATION */}
        {step === 5 && (
          <div className="p-6 sm:p-8">
            <div className="mb-7">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Confirm Appointment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your appointment details
                before confirming.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                    <Stethoscope
                      size={21}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                      Doctor
                    </p>

                    <p className="font-bold text-slate-900">
                      {selectedDoctor?.userId
                        ?.name || "Doctor"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {
                        selectedDoctor?.specialization
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
                <div className="bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {
                      selectedDepartment?.name
                    }
                  </p>
                </div>

                <div className="bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Service
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedService?.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      selectedService?.duration
                    }{" "}
                    minutes · ₹
                    {
                      selectedService?.price
                    }
                  </p>
                </div>

                <div className="bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(
                      formData.appointmentDate
                    )}
                  </p>
                </div>

                <div className="bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Time
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatTime(
                      formData.startTime
                    )}
                  </p>
                </div>
              </div>

              {formData.reason && (
                <div className="border-t border-slate-100 bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Reason for Visit
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {formData.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={19}
                  className="mt-0.5 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Ready to book?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Please make sure all the
                    appointment details above are
                    correct before confirming.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={booking}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="submit"
                disabled={booking}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={18}
                    />
                    Confirm Appointment
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default BookAppointment;