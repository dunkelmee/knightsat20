"""Ported from src/data/initialData.ts — fictional demo fixtures.

Only ever loaded on demand via POST /api/admin/reset-demo-data. A fresh production
database is intentionally left empty so real committee members never see fake pledges.
"""

from datetime import datetime, timedelta as _td, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Album,
    Announcement,
    EventDetails,
    Photo,
    PlannedExpense,
    RSVPRecord,
    SurveyResponse,
    User,
)

EVENT_DETAILS_SEED = {
    "status": "Pending",
    "date": "Pending / For finalization",
    "time": "TBA (Target: 6:00 PM – 10:30 PM)",
    "venue": "Pending / For finalization",
    "venue_address": "Makati / BGC Area (Based on Survey Results)",
    "dress_code": "Smart Casual / Semi-Formal",
    "theme": "MakSci Batch 2007 Reunion & Homecoming",
    "notes": "Final date and venue contracts will be selected based on survey consensus.",
}

ANNOUNCEMENTS_SEED = [
    {
        "id": "ann-1",
        "title": "📢 MSHS Batch 2007: Official Planning Survey is Now Live!",
        "caption": "Calling all Makati Science High School Batch 2007 alumni! As we gear up for our milestone reunion, our planning committee needs your input. Please fill out the planning survey below so we can finalize our date, venue, activities, and budget.",
        "image_url": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
        "tag": "Survey",
        "author": "Batch 2007 Core Committee",
        "date": "August 24, 2026",
        "is_pinned": True,
        "likes_count": 38,
    },
    {
        "id": "ann-2",
        "title": "📍 Venue & Date Scouting Update",
        "caption": "We are currently shortlisting potential venues (Makati / BGC hotel function hall, Intramuros rooftop events place, Tagaytay resort, and private dining places). Cast your vote in the survey so we can select the most accessible location and date for everyone including balikbayans!",
        "image_url": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
        "tag": "Venue",
        "author": "Logistics Team",
        "date": "August 20, 2026",
        "is_pinned": False,
        "likes_count": 24,
    },
    {
        "id": "ann-3",
        "title": "💰 Transparent Batch Operating Funds Dashboard",
        "caption": "In true Makati Science transparency spirit, we have launched an open Operating Funds & Pledge tracking dashboard. All batch contributions, sponsorships, and planned expenditures will be reported here in real time with our live running balance.",
        "image_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
        "tag": "Finance",
        "author": "Finance & Treasury Committee",
        "date": "August 18, 2026",
        "is_pinned": False,
        "likes_count": 31,
    },
]

EXPENSES_SEED = [
    {
        "id": "exp-1",
        "name": "Venue Reservation & Dinner Banquet (Est. 70 pax)",
        "category": "Venue & Banquet",
        "amount": 140000,
        "target_date": "2026-11-15",
        "status": "Quoted",
        "notes": "Estimated ₱2,000/head buffet banquet plus venue rental for 5 hours.",
    },
    {
        "id": "exp-2",
        "name": "Audio-Visual Lights, Sound System & LED Wall Display",
        "category": "Audio Visual & Lights",
        "amount": 25000,
        "target_date": "2026-11-15",
        "status": "Estimated",
        "notes": "For throwback slide presentation, batch tribute video, and open mic/band.",
    },
    {
        "id": "exp-3",
        "name": "Batch Souvenir Shirts & Commemorative Tokens",
        "category": "Souvenirs & T-Shirts",
        "amount": 35000,
        "target_date": "2026-10-30",
        "status": "Estimated",
        "notes": "Custom dri-fit batch shirts and engraved keepsake keychains / mugs.",
    },
    {
        "id": "exp-4",
        "name": "Official Photographer, Videographer & Photo Booth",
        "category": "Photo & Video",
        "amount": 20000,
        "target_date": "2026-11-15",
        "status": "Quoted",
        "notes": "Unlimited photo booth with magnetic prints + highlight reel coverage.",
    },
    {
        "id": "exp-5",
        "name": "Raffle Prizes, Batch Awards & Faculty Tokens",
        "category": "Prizes & Tokens",
        "amount": 18000,
        "target_date": "2026-11-01",
        "status": "Estimated",
        "notes": "Special tokens for beloved former MSHS teachers and fun batch trivia prizes.",
    },
    {
        "id": "exp-6",
        "name": "Stage Styling, Backdrop & Photo Wall",
        "category": "Decorations & Program",
        "amount": 15000,
        "target_date": "2026-11-15",
        "status": "Estimated",
        "notes": "MakSci Nostalgia throwback theme display and backdrop styling.",
    },
]

SURVEY_RESPONSES_SEED = [
    {
        "id": "resp-1",
        "full_name": "Maria Cristina Santos",
        "contact_number": "09171234567",
        "email": "mc.santos@gmail.com",
        "section2007": "IV-Curie",
        "attendance": "Yes, definitely!",
        "preferred_months": ["April", "December"],
        "specific_date_notes": "Any Saturday evening in April or December 2027 would be perfect!",
        "venue_suggestion": "The Blue Leaf Pavilion, Taguig",
        "preferred_venue_type": ["Hotel / function room"],
        "pledge_option": "₱5,000",
        "other_sponsorships": ["Prizes / raffle items", "Graphic design / invitations"],
        "other_sponsorship_details": "Can donate 2 units of gadgets for raffle and help design event logo.",
        "skills_offered": ["Graphic design / invitations", "Event planning / coordination"],
        "skills_details": "I work in creative brand management, happy to layout tickets and backdrops!",
        "nominated_organizer": "Events by Amanda Manila",
        "willing_to_organize": "Yes, I’d be happy to help!",
        "bringing_plus_one": "Yes, 1 +1",
        "bringing_kids": "No",
        "kids_count": 0,
        "other_suggestions": "Let’s invite our favorite Chemistry and Physics teachers as honored guests!",
        "pledge_paid_status": "Fully Paid",
    },
    {
        "id": "resp-2",
        "full_name": "Engr. Carlo Mendoza",
        "contact_number": "09189876543",
        "email": "carlo.mendoza@engineer.com",
        "section2007": "IV-Newton",
        "attendance": "Yes, definitely!",
        "preferred_months": ["December"],
        "specific_date_notes": "Mid-December 2027 so overseas batchmates can fly in for the holidays.",
        "venue_suggestion": "Crowne Plaza Galleria Manila / Ortigas",
        "preferred_venue_type": ["Hotel / function room"],
        "pledge_option": "₱10,000+",
        "custom_pledge_amount": "15000",
        "other_sponsorships": ["Financial sponsorship", "Drinks / refreshments"],
        "other_sponsorship_details": "Pledging ₱15,000 for main operations + sponsored craft beers/wine.",
        "skills_offered": ["Event planning / coordination", "Hosting / emceeing", "Accounting / budgeting"],
        "skills_details": "Happy to lead overall program committee and coordinate supplier contracts.",
        "nominated_organizer": "Makati Belle Events Management",
        "willing_to_organize": "Yes, I’d be happy to help!",
        "bringing_plus_one": "Yes, 1 +1",
        "bringing_kids": "Yes",
        "kids_count": 2,
        "other_suggestions": "Let’s prepare a throwback video compilation and photo gallery in the lobby.",
        "pledge_paid_status": "Partially Paid",
    },
    {
        "id": "resp-3",
        "full_name": "Dr. Katrina Beatrice Reyes",
        "contact_number": "09205557890",
        "email": "dr.kat.reyes@medcenter.ph",
        "section2007": "IV-Einstein",
        "attendance": "Most likely, but still confirming",
        "attendance_reason": "Checking hospital on-call schedule for 2027.",
        "preferred_months": ["April"],
        "specific_date_notes": "Saturday evening after Easter weekend.",
        "venue_suggestion": "Palacio de Maynila or Intramuros",
        "preferred_venue_type": ["Restaurant / private dining"],
        "pledge_option": "₱5,000",
        "other_sponsorships": ["Prizes / raffle items"],
        "other_sponsorship_details": "Donating gift certificates for batch wellness hamper.",
        "skills_offered": ["Program / activities", "Registration / guest management"],
        "skills_details": "Can help manage guest registration desk and table assignments.",
        "nominated_organizer": "Bella Vita Events & Productions",
        "willing_to_organize": "I can help occasionally",
        "bringing_plus_one": "No",
        "bringing_kids": "No",
        "kids_count": 0,
        "other_suggestions": "A live acoustic band or batchmate jam session would be fantastic!",
        "pledge_paid_status": "Unpaid / Pledged",
    },
    {
        "id": "resp-4",
        "full_name": "Atty. Rafael Joaquin Dizon",
        "contact_number": "09176543210",
        "email": "atty.dizon@lawfirm.ph",
        "section2007": "IV-Dalton",
        "attendance": "Yes, definitely!",
        "preferred_months": ["April", "December"],
        "specific_date_notes": "April 24 or December 18, 2027",
        "venue_suggestion": "Club Filipino, Greenhills",
        "preferred_venue_type": ["Private house / events place"],
        "pledge_option": "Custom Amount",
        "custom_pledge_amount": "7500",
        "other_sponsorships": ["Printing / souvenirs", "Prizes / raffle items"],
        "other_sponsorship_details": "Can sponsor printed keepsake yearbooks and custom batch lanyards.",
        "skills_offered": ["Hosting / emceeing", "Social media / communications"],
        "skills_details": "Experienced host/emcee, ready to host the formal program and games!",
        "nominated_organizer": "Grand Milestones Events Agency",
        "willing_to_organize": "Yes, I’d be happy to help!",
        "bringing_plus_one": "Yes, 1 +1",
        "bringing_kids": "No",
        "kids_count": 0,
        "other_suggestions": "Trivia contest about our high school teachers and classic MSHS moments.",
        "pledge_paid_status": "Fully Paid",
    },
    {
        "id": "resp-5",
        "full_name": "Patricia Marie Alcantara",
        "contact_number": "09281239876",
        "email": "pat.alcantara@studio.com",
        "section2007": "IV-Darwin",
        "attendance": "Yes, definitely!",
        "preferred_months": ["April", "December"],
        "specific_date_notes": "Any weekend in April or December 2027",
        "venue_suggestion": "MSHS Campus Grounds & Rooftop Hall",
        "preferred_venue_type": ["School / campus"],
        "pledge_option": "₱3,000",
        "other_sponsorships": ["Photography / videography"],
        "other_sponsorship_details": "Providing pro photo coverage and edited 4k video montage.",
        "skills_offered": ["Photography / videography", "Technical / sound & lights"],
        "skills_details": "I own a multimedia studio, we will handle multi-cam video shoot!",
        "nominated_organizer": "The Concept Events Studio",
        "willing_to_organize": "Maybe, depending on what’s needed",
        "bringing_plus_one": "No",
        "bringing_kids": "No",
        "kids_count": 0,
        "other_suggestions": "Let’s do a quick morning campus visit followed by evening grand banquet.",
        "pledge_paid_status": "Unpaid / Pledged",
    },
    {
        "id": "resp-6",
        "full_name": "Gian Paolo Ramos",
        "contact_number": "09081122334",
        "email": "gian.ramos@techcorp.io",
        "section2007": "IV-Curie",
        "attendance": "Not sure yet",
        "attendance_reason": "Depends on work travel schedule in 2027.",
        "preferred_months": ["December"],
        "specific_date_notes": "Around Dec 15-22, 2027",
        "venue_suggestion": "Resort in Antipolo / Rizal",
        "preferred_venue_type": ["Resort / outdoor venue"],
        "pledge_option": "₱2,000",
        "other_sponsorships": ["None for now"],
        "skills_offered": ["I’d prefer to just attend 😊"],
        "nominated_organizer": "Urban Eventive Co.",
        "willing_to_organize": "I’d prefer not to be involved in organizing",
        "bringing_plus_one": "Not sure yet",
        "bringing_kids": "No",
        "kids_count": 0,
        "other_suggestions": "Make sure there is high-speed WiFi and live stream for batchmates overseas.",
        "pledge_paid_status": "Unpaid / Pledged",
    },
    {
        "id": "resp-7",
        "full_name": "Sheryl Anne Tan-Lim",
        "contact_number": "09198765432",
        "email": "sheryl.tan@culinary.ph",
        "section2007": "IV-Newton",
        "attendance": "Yes, definitely!",
        "preferred_months": ["April"],
        "specific_date_notes": "Saturday in late April 2027",
        "venue_suggestion": "Glasshouse at Greenbelt or BGC High Street",
        "preferred_venue_type": ["Restaurant / private dining"],
        "pledge_option": "Custom Amount",
        "custom_pledge_amount": "12500",
        "other_sponsorships": ["Food / catering", "Drinks / refreshments"],
        "other_sponsorship_details": "Sponsoring custom dessert bar and 2-tiered reunion cake!",
        "skills_offered": ["Food / catering", "Sourcing suppliers / venue"],
        "skills_details": "I run a pastry and catering kitchen, can supply pastries and manage tasting.",
        "nominated_organizer": "Viva Events & Productions",
        "willing_to_organize": "Yes, I’d be happy to help!",
        "bringing_plus_one": "Yes, 1 +1",
        "bringing_kids": "Yes",
        "kids_count": 1,
        "other_suggestions": "Provide a kids play corner or quiet area so parents can mingle easily.",
        "pledge_paid_status": "Fully Paid",
    },
    {
        "id": "resp-8",
        "full_name": "Mark Dennis Fernandez",
        "contact_number": "09156789012",
        "email": "dennis.f@sgconsulting.com",
        "section2007": "IV-Einstein",
        "attendance": "Yes, definitely!",
        "preferred_months": ["December"],
        "specific_date_notes": "December 18-24, 2027 (Returning from Singapore for Christmas holidays)",
        "venue_suggestion": "Manila Hotel Champagne Room or Centennial Hall",
        "preferred_venue_type": ["Hotel / function room"],
        "pledge_option": "₱10,000+",
        "custom_pledge_amount": "20000",
        "other_sponsorships": ["Financial sponsorship", "Event equipment / sound system"],
        "other_sponsorship_details": "Pledging ₱20k towards audio-visual setup and teacher stipends.",
        "skills_offered": ["Music / DJ", "Technical / sound & lights"],
        "skills_details": "I do DJing as a hobby, will prepare our 2000s throwback playlist!",
        "nominated_organizer": "Sound & Stage Event Planners",
        "willing_to_organize": "Yes, I’d be happy to help!",
        "bringing_plus_one": "Yes, 1 +1",
        "bringing_kids": "No",
        "kids_count": 0,
        "other_suggestions": "Let’s play classic 2000s OPM and rock anthems we used to listen to in high school.",
        "pledge_paid_status": "Fully Paid",
    },
    {
        "id": "resp-9",
        "full_name": "Joanna Rose Perez",
        "contact_number": "09224466880",
        "email": "joanna.perez@gov.ph",
        "section2007": "IV-Dalton",
        "attendance": "Unfortunately, I won’t be able to attend",
        "attendance_reason": "Will be in the US for graduate school fellowship during 2027.",
        "preferred_months": ["April", "December"],
        "preferred_venue_type": ["Hotel / function room"],
        "pledge_option": "₱2,000",
        "other_sponsorships": ["Prizes / raffle items"],
        "other_sponsorship_details": "Still want to support the batch funds even though I cannot attend physically!",
        "skills_offered": ["Social media / communications"],
        "skills_details": "Can help manage the batch Facebook / IG page and post live updates.",
        "nominated_organizer": "Events by Amanda Manila",
        "willing_to_organize": "I can help occasionally",
        "bringing_plus_one": "No",
        "bringing_kids": "No",
        "kids_count": 0,
        "other_suggestions": "Please set up a Zoom / YouTube private live stream for batchmates abroad!",
        "pledge_paid_status": "Fully Paid",
    },
]

RSVPS_SEED = [
    {
        "id": "rsvp-1",
        "full_name": "Maria Cristina Santos",
        "contact_number": "09171234567",
        "email": "mc.santos@gmail.com",
        "status": "Attending",
        "bringing_plus_one": True,
        "kids_count": 0,
        "dietary_restrictions": "Pescatarian",
        "message_to_batch": "Can’t wait to see everyone after so many years! 🧪✨",
    },
    {
        "id": "rsvp-2",
        "full_name": "Engr. Carlo Mendoza",
        "contact_number": "09189876543",
        "email": "carlo.mendoza@engineer.com",
        "status": "Attending",
        "bringing_plus_one": True,
        "kids_count": 2,
        "dietary_restrictions": "None",
        "message_to_batch": "Let’s make our 2007 reunion one for the history books! 🔬",
    },
    {
        "id": "rsvp-3",
        "full_name": "Dr. Katrina Beatrice Reyes",
        "contact_number": "09205557890",
        "email": "dr.kat.reyes@medcenter.ph",
        "status": "Maybe",
        "bringing_plus_one": False,
        "kids_count": 0,
        "dietary_restrictions": "No beef",
        "message_to_batch": "Hoping the hospital roster permits! So excited!",
    },
    {
        "id": "rsvp-4",
        "full_name": "Atty. Rafael Joaquin Dizon",
        "contact_number": "09176543210",
        "email": "atty.dizon@lawfirm.ph",
        "status": "Attending",
        "bringing_plus_one": True,
        "kids_count": 0,
        "dietary_restrictions": "None",
        "message_to_batch": "Prepared my high school throwback stories already haha!",
    },
    {
        "id": "rsvp-5",
        "full_name": "Patricia Marie Alcantara",
        "contact_number": "09281239876",
        "email": "pat.alcantara@studio.com",
        "status": "Attending",
        "bringing_plus_one": False,
        "kids_count": 0,
        "dietary_restrictions": "No seafood",
        "message_to_batch": "Bringing studio gear for portrait sessions!",
    },
    {
        "id": "rsvp-6",
        "full_name": "Sheryl Anne Tan-Lim",
        "contact_number": "09198765432",
        "email": "sheryl.tan@culinary.ph",
        "status": "Attending",
        "bringing_plus_one": True,
        "kids_count": 1,
        "dietary_restrictions": "None",
        "message_to_batch": "Cake is on me! See you batchmates ❤️",
    },
    {
        "id": "rsvp-7",
        "full_name": "Mark Dennis Fernandez",
        "contact_number": "09156789012",
        "email": "dennis.f@sgconsulting.com",
        "status": "Attending",
        "bringing_plus_one": True,
        "kids_count": 0,
        "dietary_restrictions": "None",
        "message_to_batch": "Flying home for this! Countdown begins!",
    },
]


# ---------------------------------------------------------------------------
# Directory demo alumni — real `users` rows (is_demo=True) so the Directory
# tab has something to browse. `attending` drives whether a matching
# SurveyResponse is created (Directory status is derived from that FK, see
# routers/directory.py — not from the free-text RSVP roster above).
# ---------------------------------------------------------------------------

DEMO_ALUMNI_SEED = [
    {
        "id": "demo-user-1", "full_name": "Maria (Santos) Reyes", "email": "demo.maria.reyes@mshs2007.demo",
        "mobile_number": "09171110001",
        "then_photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=60",
        "current_city": "Makati", "current_role": "UX Director", "section_hs": "IV-Curie",
        "is_faculty": False, "attending": True,
    },
    {
        "id": "demo-user-2", "full_name": "Daniel Cruz", "email": "demo.daniel.cruz@mshs2007.demo",
        "mobile_number": "09171110002",
        "then_photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=60",
        "now_photo_url": None,
        "current_city": "Cebu City", "current_role": None, "section_hs": "IV-Newton",
        "is_faculty": False, "attending": False,
    },
    {
        "id": "demo-user-3", "full_name": "Marcus Villanueva", "email": "demo.marcus.villanueva@mshs2007.demo",
        "mobile_number": "09171110003",
        "then_photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=60",
        "current_city": "Taguig", "current_role": "Software Engineer", "section_hs": "IV-Einstein",
        "is_faculty": False, "attending": True,
    },
    {
        "id": "demo-user-4", "full_name": "Elena Bautista", "email": "demo.elena.bautista@mshs2007.demo",
        "mobile_number": "09171110004",
        "then_photo_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=60",
        "current_city": "Quezon City", "current_role": "Veterinarian", "section_hs": "IV-Dalton",
        "is_faculty": False, "attending": True,
    },
    {
        "id": "demo-user-5", "full_name": "Paolo Mendoza", "email": "demo.paolo.mendoza@mshs2007.demo",
        "mobile_number": "09171110005",
        "then_photo_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=60",
        "current_city": "Pasig", "current_role": "Architect", "section_hs": "IV-Darwin",
        "is_faculty": False, "attending": True,
    },
    {
        "id": "demo-user-6", "full_name": "Grace Lim", "email": "demo.grace.lim@mshs2007.demo",
        "mobile_number": "09171110006",
        "then_photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=60",
        "now_photo_url": None,
        "current_city": "Davao", "current_role": None, "section_hs": "IV-Curie",
        "is_faculty": False, "attending": False,
    },
    {
        "id": "demo-user-7", "full_name": "Gian Paolo Ramos", "email": "demo.gian.ramos@mshs2007.demo",
        "mobile_number": "09171110007",
        "then_photo_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=60",
        "current_city": "Singapore", "current_role": "Product Manager", "section_hs": "IV-Newton",
        "is_faculty": False, "attending": True,
    },
    {
        "id": "demo-user-8", "full_name": "Sheryl Anne Tan-Lim", "email": "demo.sheryl.tanlim@mshs2007.demo",
        "mobile_number": "09171110008",
        "then_photo_url": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=60",
        "current_city": "BGC, Taguig", "current_role": "Pastry Chef / Caterer", "section_hs": "IV-Newton",
        "is_faculty": False, "attending": True,
    },
    {
        "id": "demo-user-9", "full_name": "Mark Dennis Fernandez", "email": "demo.mark.fernandez@mshs2007.demo",
        "mobile_number": "09171110009",
        "then_photo_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=60",
        "now_photo_url": None,
        "current_city": "Singapore", "current_role": None, "section_hs": "IV-Einstein",
        "is_faculty": False, "attending": False,
    },
    {
        "id": "demo-user-10", "full_name": "Joanna Rose Perez", "email": "demo.joanna.perez@mshs2007.demo",
        "mobile_number": "09171110010",
        "then_photo_url": "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=60",
        "current_city": "Boston, USA", "current_role": "Grad Student", "section_hs": "IV-Dalton",
        "is_faculty": False, "attending": True,
    },
    {
        "id": "demo-user-11", "full_name": "Mr. Antonio Villareal", "email": "demo.antonio.villareal@mshs2007.demo",
        "mobile_number": "09171110011",
        "then_photo_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=60",
        "current_city": "Makati", "current_role": "Physics Teacher (Retired)", "section_hs": None,
        "is_faculty": True, "attending": False,
    },
    {
        "id": "demo-user-12", "full_name": "Ms. Corazon Villamor", "email": "demo.corazon.villamor@mshs2007.demo",
        "mobile_number": "09171110012",
        "then_photo_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=60",
        "now_photo_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=60",
        "current_city": "Quezon City", "current_role": "Chemistry Teacher", "section_hs": None,
        "is_faculty": True, "attending": False,
    },
]

DEMO_ALBUMS_SEED = [
    {
        "id": "album-1",
        "title": "Throwback: HS Days '03–'07",
        "description": "Class photos, field trips, and everyday high school life.",
        "created_by": "demo-user-1",
        "is_live_day": False,
        "photos": [
            ("demo-user-1", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=70"),
            ("demo-user-3", "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=70"),
            ("demo-user-4", "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=70"),
            ("demo-user-5", "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=70"),
            ("demo-user-7", "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=70"),
            ("demo-user-8", "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=70"),
        ],
    },
    {
        "id": "album-2",
        "title": "Batch Trips & Reunions",
        "description": "Meetups, mini-reunions, and out-of-town trips since graduation.",
        "created_by": "demo-user-3",
        "is_live_day": False,
        "photos": [
            ("demo-user-3", "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=70"),
            ("demo-user-4", "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=70"),
            ("demo-user-5", "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=70"),
            ("demo-user-10", "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=70"),
        ],
    },
    {
        "id": "album-3",
        "title": "Reunion Day — Live Uploads",
        "description": "Opens on reunion day — projected live at the venue.",
        "created_by": "demo-user-1",
        "is_live_day": True,
        "photos": [],
    },
]


# Minimal, valid answers for the required survey fields — only used to give
# "attending" demo alumni a SurveyResponse for Directory status derivation
# (see routers/directory.py), not meant to be interesting seed content.
_DEMO_SURVEY_DEFAULTS = {
    "attendance": "Yes, definitely!",
    "preferred_venue_type": ["Hotel / function room"],
    "pledge_option": "₱2,000",
    "willing_to_organize": "Maybe, depending on what’s needed",
}


async def reset_demo_data(session: AsyncSession) -> None:
    from app.pledge import parse_pledge_amount

    # Children before parents: SurveyResponse/Album/Photo all FK to users,
    # so every table that can reference a `users` row must be cleared before
    # the demo `users` rows themselves are deleted below.
    await session.execute(delete(SurveyResponse))
    await session.execute(delete(RSVPRecord))
    await session.execute(delete(Announcement))
    await session.execute(delete(PlannedExpense))
    await session.execute(delete(EventDetails))
    # Scoped to demo-owned albums only — a bare `delete(Album)` previously wiped
    # every album (and, via cascade, every photo row) including ones real
    # alumni had uploaded to the Photo Wall. Must run before the demo users
    # below are deleted, since it relies on their is_demo flag still being set.
    demo_user_ids = select(User.id).where(User.is_demo.is_(True))
    await session.execute(delete(Album).where(Album.created_by.in_(demo_user_ids)))  # cascades photos
    # Only ever deletes fixture accounts — real registered alumni (is_demo=false)
    # are never touched by a reset.
    await session.execute(delete(User).where(User.is_demo.is_(True)))

    now = datetime.now(timezone.utc)

    session.add(EventDetails(id=EventDetails.SINGLETON_ID, updated_at=now, **EVENT_DETAILS_SEED))

    for offset, row in enumerate(ANNOUNCEMENTS_SEED):
        # Preserve seed list order (newest first) regardless of insert order.
        session.add(Announcement(created_at=now.replace(microsecond=0) - _td(minutes=offset), **row))

    for row in EXPENSES_SEED:
        session.add(PlannedExpense(updated_at=now, **row))

    for row in SURVEY_RESPONSES_SEED:
        row = dict(row)
        row["computed_pledge_amount"] = parse_pledge_amount(
            row["pledge_option"], row.get("custom_pledge_amount")
        )
        session.add(SurveyResponse(submitted_at=now, **row))

    for row in RSVPS_SEED:
        session.add(RSVPRecord(submitted_at=now, **row))

    for row in DEMO_ALUMNI_SEED:
        row = dict(row)
        row.pop("attending")
        session.add(User(is_demo=True, onboarding_completed_at=now, created_at=now, **row))

    # Demo users must exist before the SurveyResponse/Album/Photo rows below
    # reference their ids via FK.
    await session.flush()

    for row in DEMO_ALUMNI_SEED:
        if not row["attending"]:
            continue
        session.add(
            SurveyResponse(
                submitted_at=now,
                user_id=row["id"],
                full_name=row["full_name"],
                contact_number=row["mobile_number"],
                email=row["email"],
                computed_pledge_amount=parse_pledge_amount(_DEMO_SURVEY_DEFAULTS["pledge_option"], None),
                **_DEMO_SURVEY_DEFAULTS,
            )
        )

    for album_row in DEMO_ALBUMS_SEED:
        photos = album_row["photos"]
        session.add(
            Album(
                id=album_row["id"],
                title=album_row["title"],
                description=album_row["description"],
                created_by=album_row["created_by"],
                is_live_day=album_row["is_live_day"],
                created_at=now,
            )
        )
        for photo_offset, (uploader_id, image_url) in enumerate(photos):
            session.add(
                Photo(
                    album_id=album_row["id"],
                    uploaded_by=uploader_id,
                    storage_key=image_url,
                    thumb_key=image_url,
                    created_at=now - _td(minutes=len(photos) - photo_offset),
                )
            )

    await session.commit()
