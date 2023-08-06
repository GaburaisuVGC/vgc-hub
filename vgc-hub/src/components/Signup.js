import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Signup = () => {

  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté (en vérifiant la présence du jeton JWT)
    const jwtToken = localStorage.getItem('jwtToken');
    if (jwtToken) {
      // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
      navigate('/');
    }
  }, [navigate]);


  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Le nom d\'utilisateur est requis'),
    email: Yup.string().email('L\'adresse e-mail est invalide').required('L\'adresse e-mail est requise'),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(64, 'Le mot de passe ne peut pas contenir plus de 64 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule et un chiffre')
      .required('Le mot de passe est requis'),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/signup`, {
        username: values.username,
        email: values.email,
        password: values.password,
      });

      toast.success(response.data.message);
    } catch (error) {
      setErrors({ password: error.response.data.error }); // Afficher l'erreur liée au mot de passe
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <Field
              type="text"
              name="username"
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <ErrorMessage name="username" component="div" className="text-red-500 text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <Field
              type="email"
              name="email"
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <Field
              type="password"
              name="password"
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            S'inscrire
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default Signup;