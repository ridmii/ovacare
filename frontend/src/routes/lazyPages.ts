import { lazy } from 'react'

export const HomePage = lazy(
  () =>
    import(
      /* webpackChunkName: "page-home" */
      /* webpackMode: "lazy" */
      '../pages/HomePage'
    ).then((m) => ({ default: m.HomePage }))
)

export const ScanPage = lazy(
  () =>
    import(
      /* webpackChunkName: "page-scan" */
      /* webpackMode: "lazy" */
      '../pages/ScanPage'
    ).then((m) => ({ default: m.ScanPage }))
)

export const EducationPage = lazy(
  () =>
    import(
      /* webpackChunkName: "page-education" */
      /* webpackMode: "lazy" */
      '../pages/EducationPage'
    ).then((m) => ({ default: m.EducationPage }))
)

export const DoctorsPage = lazy(
  () =>
    import(
      /* webpackChunkName: "page-doctors" */
      /* webpackMode: "lazy" */
      '../pages/DoctorsPage'
    ).then((m) => ({ default: m.DoctorsPage }))
)

export const BookingPage = lazy(
  () =>
    import(
      /* webpackChunkName: "page-booking" */
      /* webpackMode: "lazy" */
      '../pages/Booking'
    ).then((m) => ({ default: m.BookingPage }))
)

export const BookingConfirmationPage = lazy(
  () =>
    import(
      /* webpackChunkName: "page-booking-confirmation" */
      /* webpackMode: "lazy" */
      '../pages/BookingConfirmation'
    ).then((m) => ({ default: m.BookingConfirmationPage }))
)
