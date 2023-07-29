import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';


const Signup = () => {
  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Le nom d\'utilisateur est requis'),
    email: Yup.string().email('L\'adresse e-mail est invalide').required('L\'adresse e-mail est requise'),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule et un chiffre')
      .required('Le mot de passe est requis'),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post('http://localhost:5000/auth/signup', {
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
    <div>
      <h2>Signup</h2>
      <Formik
        initialValues={{ username: '', email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form>
          <div>
            <label htmlFor="username">Nom d'utilisateur</label>
            <Field type="text" name="username" />
            <ErrorMessage name="username" component="div" />
          </div>
          <div>
            <label htmlFor="email">E-mail</label>
            <Field type="email" name="email" />
            <ErrorMessage name="email" component="div" />
          </div>
          <div>
            <label htmlFor="password">Mot de passe</label>
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" />
          </div>
          <button type="submit">S'inscrire</button>
        </Form>
      </Formik>
    </div>
  );
};

export default Signup;
