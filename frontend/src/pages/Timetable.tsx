import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { TimetableSlot } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight,
  Circle, Clock3, MapPin, UserRound,
} from 'lucide-react';

const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const periods = [
  { start: '09:00 AM', end: '09:50 AM' },
  { start: '10:00 AM', end: '10:50 AM' },
  { start: '11:00 AM', end: '11:50 AM' },
  { start: '11:50 AM', end: '12:40 PM' },
  { start: '01:30 PM', end: '02:20 PM' },
  { start: '02:20 PM', end: '03:10 PM' },
  { start: '03:10 PM', end: '04:00 PM' },
];
const subjectAccents = [
  { background: '#e5f1ff', color: '#1677f2' },
  { background: '#e5f8ef', color: '#159766' },
  { background: '#f0eaff', color: '#7651d6' },
  { background: '#fff1e4', color: '#e88422' },
  { background: '#ffebf2', color: '#d74683' },
  { background: '#e5f8fb', color: '#1299ac' },
  { background: '#f2eaff', color: '#a14db5' },
];

const toMinutes = (time: string) => {
  const [clock, meridiem] = time.split(' ');
  let [hour, minute] = clock.split(':').map(Number);
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const dayName = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

export const Timetable: React.FC = () => {
  const { studentProfile } = useAuth();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const weekdayIndex = (now.getDay() + 6) % 7;
  const today = days[weekdayIndex] ?? 'MONDAY';
  const [selectedDay, setSelectedDay] = useState(today);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setSlots(await apiClient.getTimetable());
      } catch (err) {
        console.error('Failed to load timetable', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading) return <div style={{ padding: '30px' }}>Loading class schedule...</div>;

  const daySlots = slots
    .filter((slot) => slot.dayOfWeek.toUpperCase() === selectedDay)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const academicYearStart = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - weekdayIndex + weekOffset * 7);
  const getDayDate = (day: string) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + days.indexOf(day));
    return date;
  };
  const selectedDate = getDayDate(selectedDay);
  const isToday = selectedDate.toDateString() === new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
  const getStatus = (index: number) => {
    if (!isToday) return 'SCHEDULED';
    if (nowMinutes >= toMinutes(periods[index].end)) return 'COMPLETED';
    if (nowMinutes >= toMinutes(periods[index].start)) return 'ONGOING';
    return 'UPCOMING';
  };
  const activeIndex = isToday
    ? periods.findIndex((period) => nowMinutes >= toMinutes(period.start) && nowMinutes < toMinutes(period.end))
    : -1;
  const onBreak = isToday && ((nowMinutes >= 10 * 60 + 50 && nowMinutes < 11 * 60) || (nowMinutes >= 12 * 60 + 40 && nowMinutes < 13 * 60 + 30));
  const completedCount = periods.filter((_, index) => getStatus(index) === 'COMPLETED').length;
  const upcomingCount = periods.filter((_, index) => getStatus(index) === 'UPCOMING').length;
  const futureClasses = periods
    .map((period, index) => ({ period, index, slot: daySlots[index], status: getStatus(index) }))
    .filter((entry) => entry.slot && (!isToday || entry.status === 'UPCOMING' || entry.status === 'ONGOING'))
    .slice(0, 3);
  const activeSlot = activeIndex >= 0 ? daySlots[activeIndex] : undefined;
  const nextSlot = futureClasses[0]?.slot;
  const activeMinutesLeft = activeIndex >= 0 ? Math.max(0, toMinutes(periods[activeIndex].end) - nowMinutes) : 0;
  const activeTimeRemaining = activeIndex >= 0 ? Math.round((activeMinutesLeft / 50) * 100) : 0;
  const initials = studentProfile ? `${studentProfile.firstName[0]}${studentProfile.lastName[0]}` : '';

  return (
    <div className="timetable-page">
      <div className="timetable-page-heading">
        <div className="timetable-title-group">
          <span className="timetable-title-icon"><CalendarDays size={22} /></span>
          <div>
            <div className="eyebrow">CampusConnect / Academics</div>
            <h1>Timetable</h1>
            <p>View your class schedule and plan your day effectively.</p>
          </div>
        </div>
        <div className="timetable-term-card">
          <div><small>Academic Year</small><strong>{academicYearStart} – {academicYearStart + 1}</strong></div>
          <div><small>Semester</small><strong>{studentProfile ? `Semester ${studentProfile.currentSemester}` : 'Current Semester'}</strong></div>
          <button className="timetable-today-button" onClick={() => { setWeekOffset(0); setSelectedDay(today); }}>Today</button>
          <span className="timetable-view-pill">Day View</span>
        </div>
      </div>

      <section className="card timetable-day-strip" aria-label="Choose a day">
        <button className="timetable-strip-arrow" aria-label="Previous week" title="Previous week" onClick={() => setWeekOffset((offset) => offset - 1)}><ChevronLeft size={17} /></button>
        <div className="timetable-day-options">
          {days.map((day) => {
            const date = getDayDate(day);
            const selected = selectedDay === day;
            return (
              <button key={day} className={`timetable-day-option ${selected ? 'selected' : ''} ${weekOffset === 0 && day === today && now.getDay() !== 0 ? 'today' : ''}`} onClick={() => setSelectedDay(day)} aria-pressed={selected}>
                <span>{dayName(day)}</span>
                <strong>{date.toLocaleDateString('en-US', { day: '2-digit' })}</strong>
                <small>{date.toLocaleDateString('en-US', { month: 'short' })}</small>
              </button>
            );
          })}
        </div>
        <button className="timetable-strip-arrow" aria-label="Next week" title="Next week" onClick={() => setWeekOffset((offset) => offset + 1)}><ChevronRight size={17} /></button>
      </section>

      <div className="timetable-content-grid">
        <section className="card timetable-list-card">
          <div className="timetable-list-heading">
            <div>
              <h2>{isToday ? "Today's Timetable" : `${dayName(selectedDay)} Timetable`}</h2>
              <p>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <span className="timetable-period-count">7 Periods</span>
          </div>

          <div className="timetable-column-head">
            <span>Time</span><span>Subject</span><span>Faculty</span><span>Room</span><span>Status</span>
          </div>

          <div className="timetable-period-list">
            {periods.map((period, index) => {
              const slot = daySlots[index];
              const status = getStatus(index);
              return <React.Fragment key={period.start}>
                {index === 2 && <div className="timetable-break tea-break"><Clock3 size={12} /> Break <span>10:50 AM – 11:00 AM</span></div>}
                {index === 4 && <div className="timetable-break lunch-break"><Clock3 size={12} /> Lunch Break <span>12:40 PM – 01:30 PM</span></div>}
                <article className={`timetable-period-row ${status.toLowerCase()}`}>
                  <div className="timetable-time"><Clock3 size={13} /><strong>{period.start}</strong><span>{period.end}</span></div>
                  <div className="timetable-subject-cell">
                    <span className="timetable-subject-icon" style={subjectAccents[index]}><BookOpen size={16} /></span>
                    <div><strong>{slot?.subjectName ?? 'No class assigned'}</strong><small>{slot?.subjectCode || `Period ${index + 1}`} · {slot?.slotType || 'Scheduled Class'}</small><small className="timetable-mobile-details">{slot?.facultyName || 'Faculty TBA'} · {slot?.roomNumber || 'Room TBA'}</small></div>
                  </div>
                  <div className="timetable-faculty-cell"><span className="timetable-avatar">{slot?.facultyName ? slot.facultyName.split(' ').slice(-2).map((part) => part[0]).join('') : '—'}</span><span>{slot?.facultyName || 'Faculty TBA'}</span></div>
                  <div className="timetable-room-cell"><MapPin size={13} /><span>{slot?.roomNumber || '—'}</span></div>
                  <span className={`timetable-status ${status.toLowerCase()}`}>
                    {status === 'COMPLETED' ? <Check size={12} /> : <Circle size={9} />}{status === 'SCHEDULED' ? 'SCHEDULED' : status}
                  </span>
                </article>
              </React.Fragment>;
            })}
          </div>
        </section>

        <aside className="timetable-side-column">
          <section className="card timetable-current-card">
            <div className="timetable-side-heading">
              <span className={`timetable-live-pill ${activeSlot ? 'is-live' : ''}`}><i />{activeSlot ? 'LIVE NOW' : onBreak ? 'ON BREAK' : 'SCHEDULE'}</span>
              <h2>{activeSlot ? 'Current Class' : onBreak ? 'Break Time' : nextSlot ? 'Next Class' : 'Class Schedule'}</h2>
            </div>
            <div className="timetable-current-body">
              <span className="timetable-current-icon"><BookOpen size={19} /></span>
              <div className="timetable-current-info">
                <strong>{activeSlot?.subjectCode || nextSlot?.subjectCode || (onBreak ? 'Enjoy your break' : 'No current class')}</strong>
                <span>{activeSlot?.subjectName || nextSlot?.subjectName || 'Check your selected day schedule'}</span>
                {(activeSlot || nextSlot) && <small>{activeSlot?.startTime || futureClasses[0]?.period.start} – {activeSlot?.endTime || futureClasses[0]?.period.end}</small>}
              </div>
              {activeSlot && <div className="timetable-remaining-ring" style={{ background: `conic-gradient(#1677f2 ${activeTimeRemaining}%, #dcecff 0)` }}><div><strong>{activeMinutesLeft}</strong><small>min left</small></div></div>}
            </div>
            <div className="timetable-current-footer">
              <span><UserRound size={13} /> {activeSlot?.facultyName || nextSlot?.facultyName || 'Faculty details appear here'}</span>
              <span><MapPin size={13} /> {activeSlot?.roomNumber || nextSlot?.roomNumber || 'Room —'}</span>
            </div>
          </section>

          <section className="card timetable-overview-card">
            <div className="timetable-side-title"><CalendarDays size={15} /><h2>{isToday ? "Today's Overview" : `${dayName(selectedDay)} Overview`}</h2></div>
            <div className="timetable-overview-stats">
              <div className="total"><CalendarDays size={14} /><strong>7</strong><span>Total Classes</span></div>
              <div className="complete"><Check size={14} /><strong>{completedCount}</strong><span>Completed</span></div>
              <div className="ongoing"><Clock3 size={14} /><strong>{isToday && activeIndex >= 0 ? 1 : 0}</strong><span>Ongoing</span></div>
              <div className="upcoming"><Circle size={14} /><strong>{isToday ? upcomingCount : 7}</strong><span>Upcoming</span></div>
            </div>
          </section>

          <section className="card timetable-upcoming-card">
            <div className="timetable-side-title"><Clock3 size={15} /><h2>Upcoming Classes</h2><span>{futureClasses.length}</span></div>
            {futureClasses.length === 0 ? <p className="timetable-no-upcoming">No more classes scheduled for this day.</p> : (
              <div className="timetable-upcoming-list">
                {futureClasses.map(({ period, index, slot, status }) => (
                  <div key={period.start} className={`timetable-upcoming-item ${status.toLowerCase()}`}>
                    <span className="upcoming-marker" />
                    <div><small>{period.start} – {period.end}</small><strong>{slot?.subjectName}</strong><span>{slot?.roomNumber} · {slot?.facultyName}</span></div>
                    <em>{status}</em>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card timetable-insights-card">
            <div className="timetable-side-title"><ArrowRight size={15} /><h2>Quick Insights</h2></div>
            <div className="timetable-insight-grid">
              <div><strong>{daySlots.length}</strong><span>Scheduled</span></div>
              <div><strong>{new Set(daySlots.map((slot) => slot.facultyName)).size}</strong><span>Faculty</span></div>
              <div><strong>{new Set(daySlots.map((slot) => slot.roomNumber)).size}</strong><span>Rooms</span></div>
            </div>
            <p><Clock3 size={12} /> College hours: 9:00 AM – 4:00 PM</p>
          </section>
        </aside>
      </div>
    </div>
  );
};
