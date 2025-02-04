import React, { useState, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Calendar } from './Calendar';
import { getAvailableTimeSlots, TimeSlot as TimeSlotType } from './utils_api';

import axios from 'axios';

const formatDateForDB = date => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

interface FormInputs {
  name: string;
  email: string;
  phone: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required')
});

export const AppointmentForm: React.FC = ({ getAppointmentList }) => {
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  const [selectedUser, setSelectedUser] = useState({});

  const [isLoaded, setIsLoaded] = useState(false);

  const [appointmentList, setAppoinments] = useState([]);

  const getAll = async () => {
    let res = await axios({
      method: 'GET',
      url: `auth/appointments/all`
    });
    let list = res.data.data;

    setAppoinments(list);

    //console.log({ appointmentList });
    const startDate = new Date();
    const endDate = addDays(startDate, 30);

    const slots = getAvailableTimeSlots(startDate, endDate, list);

    console.log({ slots });
    setTimeSlots(slots);
    ////console.log({ selectedUser: selectedUser });
    getAppointmentList();
    setIsLoaded(true);
  };

  const getUser = async () => {
    let res = await axios({
      method: 'GET',
      url: `user/${loggedInUser.user_id}`
    });
    let user = res.data.data;

    setSelectedUser(user);
    setIsLoaded(true);
  };

  useEffect(() => {
    getUser();
    getAll();
  }, []);
  const [timeSlots, setTimeSlots] = useState<TimeSlotType[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {}, []);

  const handleSubmit = async (
    values: FormInputs,
    { resetForm }: { resetForm: () => void }
  ) => {
    if (selectedSlot) {
      const appointmentData = {
        email: values.email, // The patient's email from the form values
        startTime: selectedSlot.start, // The selected start time (e.g., '2024-12-18 09:00:39')
        endTime: selectedSlot.end, // The selected end time (e.g., '2024-12-18 09:30:39')
        status: 'Pending' // Default status, can be changed if needed
      };
      const transformedData = {
        ...appointmentData,
        startTime: formatDateForDB(selectedSlot.start),
        endTime: formatDateForDB(selectedSlot.end)
      };

      let res = await axios({
        method: 'POST',
        url: 'auth/appointments/create',
        data: transformedData
      });
      getAll();
      setSelectedSlot(null);
      setIsModalOpen(false);
      resetForm();
      document.getElementById('addAppointment').close();
    }
  };

  const handleSlotSelect = (slot: TimeSlotType) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  // Close modal if clicking outside
  const handleModalClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
    isLoaded && (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Calendar timeSlots={timeSlots} onSelectSlot={handleSlotSelect} />
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={handleModalClose} // Close modal when clicking outside
          >
            <div className="bg-white p-6 rounded-lg shadow-lg sm:max-w-[425px] relative">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Book Your Appointment
              </h2>
              <p>
                {selectedSlot &&
                  `${format(
                    selectedSlot.start,
                    "MMMM d, yyyy 'at' h:mm a"
                  )} ${format(selectedSlot.end, " 'to' h:mm a")}`}
              </p>

              <Formik
                initialValues={{
                  name: selectedUser.full_name,
                  email: selectedUser.email,
                  phone: selectedUser.phone_number
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}>
                {({ errors, touched }) => (
                  <Form>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right">
                          Name
                        </label>
                        <Field
                          as="input"
                          id="name"
                          name="name"
                          className={`col-span-3 p-2 border rounded ${
                            errors.name && touched.name
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="name"
                        component="p"
                        className="text-red-500 text-sm col-start-2 col-span-3"
                      />
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="email" className="text-right">
                          Email
                        </label>
                        <Field
                          as="input"
                          id="email"
                          name="email"
                          type="email"
                          className={`col-span-3 p-2 border rounded ${
                            errors.email && touched.email
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="email"
                        component="p"
                        className="text-red-500 text-sm col-start-2 col-span-3"
                      />
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="phone" className="text-right">
                          Phone
                        </label>
                        <Field
                          as="input"
                          id="phone"
                          name="phone"
                          className={`col-span-3 p-2 border rounded ${
                            errors.phone && touched.phone
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="phone"
                        component="p"
                        className="text-red-500 text-sm col-start-2 col-span-3"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        Book Appointment
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
              {/* Close Icon */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                <i className="fas fa-times text-xl"></i>{' '}
                {/* Font Awesome Close Icon */}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );
};
