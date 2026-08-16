# Relay Data Schemas

This document outlines the basic data structures that Relay will use.

## Event
Represents a live event managed by Relay.
- `id`: string (UUID)
- `name`: string
- `date`: datetime
- `location`: string
- `budget`: number
- `guestCount`: number
- `status`: string ('planning', 'live', 'resolved')

## Vendor
Represents a service provider for an event.
- `id`: string (UUID)
- `name`: string
- `serviceType`: string ('catering', 'venue', 'entertainment')
- `cost`: number
- `capacity`: number
- `status`: string ('booked', 'pending', 'cancelled')

## Guest
Represents an attendee.
- `id`: string (UUID)
- `name`: string
- `rsvpStatus`: string ('attending', 'declined', 'pending')

## Decision
Represents a proposed action by the agent requiring human approval.
- `id`: string (UUID)
- `eventId`: string
- `disruptionType`: string
- `proposedAction`: string
- `tradeoffs`: array of strings
- `status`: string ('pending_approval', 'approved', 'rejected')
