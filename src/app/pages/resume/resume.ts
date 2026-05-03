import { Component } from '@angular/core';
import { CopyOnClickDirective } from '../../shared/copy-on-click';

interface Bullet { text: string; }

interface Job {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

interface InvolvementEntry {
  title: string;
  blurb: string;
  bullets: string[];
}

interface ProjectEntry {
  title: string;
  blurb: string;
}

interface VolunteeringEntry {
  title: string;
  blurb: string;
}

@Component({
  selector: 'app-resume',
  imports: [CopyOnClickDirective],
  templateUrl: './resume.html',
  host: { class: 'page-enter' },
})
export class ResumeComponent {
  readonly contact = {
    email: 'nikitos.gn@gmail.com',
    phone: '(203) 249-8256',
    location: 'Stamford, CT',
    linkedin: 'linkedin.com/in/hikita',
    github: 'github.com/justbeekind',
  };

  readonly education = {
    school: 'University of Connecticut',
    degree: 'Bachelor of Science, Major in Computer Science, Minor in Political Science',
    location: 'Storrs, CT',
    period: 'May 2029',
    coursework: 'Systems Organization, Systems Architecture, Cybersecurity.',
  };

  readonly skills = {
    languages: 'Assembly, C, C++, Python, Java, C#, JavaScript, TypeScript, SQL',
    technologies: 'Angular, Spring Boot, PostgreSQL, Git, Bash, Zsh',
  };

  readonly experience: Job[] = [
    {
      role: 'Full-Stack Software Developer',
      company: '2 Wings Risk Services',
      location: 'Stamford, CT',
      period: 'April 2025 – Present',
      bullets: [
        'Developing a contract automation platform using Java, Spring Boot, Angular, and PostgreSQL. Capable of handling 1,000+ client records and improving communication and reliability across law firm-company interactions.',
        'Implementing secure data processing practices to ensure confidentiality and compliance with legal standards.',
        'Designing intuitive interface systems to simplify company-law firm-client interactions, spreading access to legal services.',
      ],
    },
    {
      role: 'Code Sensei',
      company: 'Code Ninjas',
      location: 'Stamford, CT',
      period: 'September 2025 – January 2026',
      bullets: [
        'Successfully advanced 20 students ages 7-14 through coding and game development curricula, by teaching using Impact, Scratch, JavaScript, and Unity (C#).',
        'Improved 20 students’ problem-solving and critical thinking skills as measured by project completion rates, by mentoring through hands-on, project-based learning.',
      ],
    },
    {
      role: 'Computer Science Teacher Assistant',
      company: 'Westhill High School',
      location: 'Stamford, CT',
      period: 'August 2023 – May 2025',
      bullets: [
        'Helped 25 students achieve passing scores on the AP Computer Science A exam, by providing one-on-one Java support, clarifying concepts, and leading coding exercises.',
        'Maintained timely, consistent academic feedback for 25 students, by grading assignments, quizzes, and exams with detailed feedback to support improvement.',
      ],
    },
  ];

  readonly involvement: InvolvementEntry[] = [
    {
      title: 'UConn BRIDGE Program',
      blurb: 'Selective competitive summer program preparing engineering students for academic success.',
      bullets: [
        'Built academic and professional skills by engaging in college-level coursework and team-based problem-solving activities.',
      ],
    },
    {
      title: 'Formula SAE Team',
      blurb: 'Collegiate competition where students are designing, building, and racing a Formula-style vehicle.',
      bullets: [
        'Enabling real-time performance monitoring for the car, by building a Real-Time Telemetry Dashboard system that connects remotely, and streams live vehicle data.',
      ],
    },
  ];

  readonly projects: ProjectEntry[] = [
    {
      title: 'Simple Chess AI (Python)',
      blurb: 'Built a CLI chess engine featuring basic AI that uses the minimax algorithm to evaluate and select the optimal moves.',
    },
    {
      title: 'ASCII Donut (C++)',
      blurb: 'Built a real-time spinning console rendering 3D ASCII donut using trig for rotation and projection.',
    },
  ];

  readonly volunteering: VolunteeringEntry[] = [
    {
      title: 'Roxbury Elementary School',
      blurb: 'Volunteered at local elementary school during holiday events, helping with setup, organizing activities, and supporting parents and children throughout.',
    },
    {
      title: 'Petit Family Foundation 5K',
      blurb: 'Participated in a road race to support and raise awareness for charitable causes.',
    },
  ];

  readonly fluentIn = 'English, Russian, Belarusian';
  readonly softSkills = 'Leadership; Collaboration and Communication; Adaptability; Problem Solving; Time Management';
  readonly interests = 'Weightlifting; Rock Climbing; Track & Field; Chess; Custom Keyboard Building; Traveling; Foreign Languages';

  readonly lastUpdated = 'May 2026';
}
