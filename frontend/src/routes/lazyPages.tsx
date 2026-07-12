import React, { lazy } from 'react'

export const HomePage = lazy(() => import('../pages/HomePage').then((module) => ({ default: module.HomePage })))
export const ScanPage = lazy(() => import('../pages/ScanPage').then((module) => ({ default: module.ScanPage })))
export const EducationPage = lazy(() => import('../pages/EducationPage').then((module) => ({ default: module.EducationPage })))
export const DoctorsPage = lazy(() => import('../pages/DoctorsPage').then((module) => ({ default: module.DoctorsPage })))
export const BookingPage = lazy(() => import('../pages/Booking').then((module) => ({ default: module.BookingPage })))
export const BookingConfirmationPage = lazy(() => import('../pages/BookingConfirmation').then((module) => ({ default: module.BookingConfirmationPage })))
export const LoginPage = lazy(() => import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })))
export const SignupPage = lazy(() => import('../pages/SignupPage').then((module) => ({ default: module.SignupPage })))
export const ProfilePage = lazy(() => import('../pages/ProfilePage').then((module) => ({ default: module.ProfilePage })))