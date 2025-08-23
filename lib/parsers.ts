// CV and JD parsing utilities for the candidate screening system
import type { ParsedCV, ParsedJD, MatchingResult } from "./types"

export class CVParser {
  static parseCV(cvText: string): ParsedCV {
    // Mock CV parsing - in a real app, this would use NLP/ML models
    const lines = cvText.split("\n").filter((line) => line.trim())

    const parsed: ParsedCV = {
      personalInfo: this.extractPersonalInfo(cvText),
      summary: this.extractSummary(cvText),
      skills: this.extractSkills(cvText),
      experience: this.extractExperience(cvText),
      education: this.extractEducation(cvText),
      projects: this.extractProjects(cvText),
      certifications: this.extractCertifications(cvText),
      languages: this.extractLanguages(cvText),
    }

    return parsed
  }

  private static extractPersonalInfo(text: string) {
    // Extract email using regex
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
    const phoneMatch = text.match(/[+]?[1-9]?[\d\s\-$$$$]{10,}/)
    const linkedInMatch = text.match(/linkedin\.com\/in\/[\w-]+/)
    const githubMatch = text.match(/github\.com\/[\w-]+/)

    // Extract name (usually first line or after "Name:")
    const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)|Name:\s*([A-Z][a-z]+ [A-Z][a-z]+)/m)

    return {
      name: nameMatch ? nameMatch[1] || nameMatch[2] : "Unknown",
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0] : undefined,
      location: this.extractLocation(text),
      linkedIn: linkedInMatch ? linkedInMatch[0] : undefined,
      github: githubMatch ? githubMatch[0] : undefined,
    }
  }

  private static extractLocation(text: string): string | undefined {
    const locationPatterns = [
      /Location:\s*([^\n]+)/i,
      /Address:\s*([^\n]+)/i,
      /([A-Z][a-z]+,\s*[A-Z]{2})/,
      /(New York|San Francisco|Los Angeles|Chicago|Boston|Seattle|Austin|Denver)/i,
    ]

    for (const pattern of locationPatterns) {
      const match = text.match(pattern)
      if (match) return match[1] || match[0]
    }
    return undefined
  }

  private static extractSummary(text: string): string | undefined {
    const summaryPatterns = [
      /Summary:\s*([^]*?)(?=\n\n|\nExperience|\nSkills|\nEducation|$)/i,
      /Objective:\s*([^]*?)(?=\n\n|\nExperience|\nSkills|\nEducation|$)/i,
      /Profile:\s*([^]*?)(?=\n\n|\nExperience|\nSkills|\nEducation|$)/i,
    ]

    for (const pattern of summaryPatterns) {
      const match = text.match(pattern)
      if (match) return match[1].trim()
    }
    return undefined
  }

  private static extractSkills(text: string): string[] {
    const skillsSection = text.match(/Skills?:\s*([^]*?)(?=\n\n|\nExperience|\nEducation|\nProjects|$)/i)
    if (!skillsSection) return []

    const skillsText = skillsSection[1]

    // Common technical skills to look for
    const commonSkills = [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "Java",
      "C++",
      "C#",
      "HTML",
      "CSS",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "AWS",
      "Azure",
      "GCP",
      "Docker",
      "Kubernetes",
      "Git",
      "Linux",
      "Next.js",
      "Vue.js",
      "Angular",
      "Express",
      "Django",
      "Flask",
      "Machine Learning",
      "AI",
      "Data Science",
      "DevOps",
      "CI/CD",
    ]

    const foundSkills = commonSkills.filter((skill) => skillsText.toLowerCase().includes(skill.toLowerCase()))

    // Also extract comma-separated skills
    const commaSeparated = skillsText
      .split(/[,\n•-]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 30)
      .slice(0, 20) // Limit to 20 skills

    return [...new Set([...foundSkills, ...commaSeparated])]
  }

  private static extractExperience(text: string): ParsedCV["experience"] {
    const experienceSection = text.match(/Experience:\s*([^]*?)(?=\n\n|\nEducation|\nSkills|\nProjects|$)/i)
    if (!experienceSection) return []

    const experiences = experienceSection[1].split(/\n\n|\n(?=[A-Z].*\d{4})/)

    return experiences
      .map((exp) => {
        const lines = exp.split("\n").filter((l) => l.trim())
        if (lines.length < 2) return null

        const firstLine = lines[0]
        const companyMatch = firstLine.match(/at\s+(.+?)(?:\s+\(|\s*$)/)
        const positionMatch = firstLine.match(/^([^@]+?)(?:\s+at\s+|$)/)
        const durationMatch = exp.match(/(\d{4})\s*[-–]\s*(\d{4}|Present)/i)

        return {
          company: companyMatch ? companyMatch[1].trim() : "Unknown Company",
          position: positionMatch ? positionMatch[1].trim() : "Unknown Position",
          duration: durationMatch ? durationMatch[0] : "Unknown Duration",
          description: lines.slice(1).join(" ").trim(),
          technologies: this.extractTechnologiesFromText(exp),
        }
      })
      .filter(Boolean) as ParsedCV["experience"]
  }

  private static extractEducation(text: string): ParsedCV["education"] {
    const educationSection = text.match(/Education:\s*([^]*?)(?=\n\n|\nExperience|\nSkills|\nProjects|$)/i)
    if (!educationSection) return []

    const educations = educationSection[1].split(/\n\n|\n(?=[A-Z])/)

    return educations
      .map((edu) => {
        const degreeMatch = edu.match(/(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.).*?in\s+([^\n,]+)/i)
        const institutionMatch = edu.match(/(?:at\s+|from\s+)([^\n,]+(?:University|College|Institute))/i)
        const yearMatch = edu.match(/(\d{4})/g)
        const gpaMatch = edu.match(/GPA:?\s*(\d+\.?\d*)/i)

        return {
          institution: institutionMatch ? institutionMatch[1].trim() : "Unknown Institution",
          degree: degreeMatch ? degreeMatch[1] : "Unknown Degree",
          field: degreeMatch ? degreeMatch[2].trim() : "Unknown Field",
          year: yearMatch ? yearMatch[yearMatch.length - 1] : "Unknown Year",
          gpa: gpaMatch ? gpaMatch[1] : undefined,
        }
      })
      .filter((edu) => edu.institution !== "Unknown Institution")
  }

  private static extractProjects(text: string): ParsedCV["projects"] {
    const projectsSection = text.match(/Projects?:\s*([^]*?)(?=\n\n|\nExperience|\nEducation|\nSkills|$)/i)
    if (!projectsSection) return undefined

    const projects = projectsSection[1].split(/\n\n|\n(?=[A-Z].*:)/)

    return projects
      .map((proj) => {
        const lines = proj.split("\n").filter((l) => l.trim())
        const nameMatch = lines[0].match(/^([^:]+)/)
        const urlMatch = proj.match(/(https?:\/\/[^\s]+)/i)

        return {
          name: nameMatch ? nameMatch[1].trim() : "Unknown Project",
          description: lines.slice(1).join(" ").trim(),
          technologies: this.extractTechnologiesFromText(proj),
          url: urlMatch ? urlMatch[1] : undefined,
        }
      })
      .filter((proj) => proj.name !== "Unknown Project")
  }

  private static extractCertifications(text: string): ParsedCV["certifications"] {
    const certsSection = text.match(/Certifications?:\s*([^]*?)(?=\n\n|\nExperience|\nEducation|\nSkills|$)/i)
    if (!certsSection) return undefined

    const certs = certsSection[1].split(/\n(?=[A-Z])/)

    return certs
      .map((cert) => {
        const lines = cert.split("\n").filter((l) => l.trim())
        const nameMatch = lines[0].match(/^([^,\n]+)/)
        const issuerMatch = cert.match(/(?:by|from|issued by)\s+([^,\n]+)/i)
        const dateMatch = cert.match(/(\d{4}|\w+\s+\d{4})/i)

        return {
          name: nameMatch ? nameMatch[1].trim() : "Unknown Certification",
          issuer: issuerMatch ? issuerMatch[1].trim() : "Unknown Issuer",
          date: dateMatch ? dateMatch[1] : "Unknown Date",
        }
      })
      .filter((cert) => cert.name !== "Unknown Certification")
  }

  private static extractLanguages(text: string): ParsedCV["languages"] {
    const langSection = text.match(/Languages?:\s*([^]*?)(?=\n\n|\nExperience|\nEducation|\nSkills|$)/i)
    if (!langSection) return undefined

    const languages = langSection[1].split(/[,\n]/)

    return languages
      .map((lang) => {
        const match = lang.match(/([A-Za-z]+)\s*[-–]?\s*(Native|Fluent|Advanced|Intermediate|Basic|Beginner)?/i)
        if (!match) return null

        return {
          language: match[1].trim(),
          proficiency: match[2] || "Unknown",
        }
      })
      .filter(Boolean) as ParsedCV["languages"]
  }

  private static extractTechnologiesFromText(text: string): string[] {
    const techKeywords = [
      "React",
      "Vue",
      "Angular",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "Python",
      "Java",
      "C++",
      "C#",
      "PHP",
      "Ruby",
      "Go",
      "Rust",
      "Swift",
      "Kotlin",
      "HTML",
      "CSS",
      "SASS",
      "LESS",
      "Bootstrap",
      "Tailwind",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Elasticsearch",
      "AWS",
      "Azure",
      "GCP",
      "Docker",
      "Kubernetes",
      "Jenkins",
    ]

    return techKeywords.filter((tech) => text.toLowerCase().includes(tech.toLowerCase()))
  }
}

export class JDParser {
  static parseJD(jdText: string): ParsedJD {
    return {
      basicInfo: this.extractBasicInfo(jdText),
      description: this.extractDescription(jdText),
      responsibilities: this.extractResponsibilities(jdText),
      requirements: this.extractRequirements(jdText),
      skills: this.extractSkills(jdText),
      benefits: this.extractBenefits(jdText),
      companyInfo: this.extractCompanyInfo(jdText),
    }
  }

  private static extractBasicInfo(text: string) {
    const titleMatch =
      text.match(/(?:Job Title|Position|Role):\s*([^\n]+)/i) || text.match(/^([^\n]+)(?:\s+at\s+|\s+-\s+)/m)

    const companyMatch = text.match(/(?:Company|Organization):\s*([^\n]+)/i) || text.match(/at\s+([A-Z][^\n,]+)/i)

    const locationMatch = text.match(/(?:Location|Based in):\s*([^\n]+)/i)
    const typeMatch = text.match(/(?:Employment Type|Job Type):\s*([^\n]+)/i)
    const salaryMatch = text.match(/(?:Salary|Compensation|Pay):\s*([^\n]+)/i)
    const experienceMatch = text.match(/(?:Experience|Years):\s*([^\n]+)/i)

    return {
      title: titleMatch ? titleMatch[1].trim() : "Unknown Position",
      company: companyMatch ? companyMatch[1].trim() : "Unknown Company",
      location: locationMatch ? locationMatch[1].trim() : "Unknown Location",
      type: typeMatch ? typeMatch[1].trim() : "Full-time",
      salary: salaryMatch ? salaryMatch[1].trim() : undefined,
      experience: experienceMatch ? experienceMatch[1].trim() : "Not specified",
    }
  }

  private static extractDescription(text: string): string {
    const descPatterns = [
      /(?:Job Description|Description|About the Role):\s*([^]*?)(?=\n\n|\nResponsibilities|\nRequirements|\nQualifications|$)/i,
      /^([^]*?)(?=\n\n|\nResponsibilities|\nRequirements|\nQualifications)/i,
    ]

    for (const pattern of descPatterns) {
      const match = text.match(pattern)
      if (match && match[1].trim().length > 50) {
        return match[1].trim()
      }
    }
    return "No description available"
  }

  private static extractResponsibilities(text: string): string[] {
    const respSection = text.match(
      /(?:Responsibilities|Duties|What you'll do):\s*([^]*?)(?=\n\n|\nRequirements|\nQualifications|\nSkills|$)/i,
    )
    if (!respSection) return []

    return respSection[1]
      .split(/\n/)
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter((line) => line.length > 10)
      .slice(0, 10)
  }

  private static extractRequirements(text: string) {
    const reqSection = text.match(
      /(?:Requirements|Qualifications|Must have):\s*([^]*?)(?=\n\n|\nPreferred|\nNice to have|\nBenefits|$)/i,
    )
    if (!reqSection) return { technical: [], soft: [], experience: [], education: [] }

    const requirements = reqSection[1]
      .split(/\n/)
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter((line) => line.length > 5)

    const technical: string[] = []
    const soft: string[] = []
    const experience: string[] = []
    const education: string[] = []

    const techKeywords = [
      "programming",
      "development",
      "coding",
      "software",
      "technical",
      "API",
      "database",
      "framework",
    ]
    const softKeywords = ["communication", "leadership", "teamwork", "problem-solving", "analytical", "creative"]
    const expKeywords = ["years", "experience", "background", "history"]
    const eduKeywords = ["degree", "bachelor", "master", "education", "university", "college"]

    requirements.forEach((req) => {
      const lowerReq = req.toLowerCase()
      if (techKeywords.some((keyword) => lowerReq.includes(keyword))) {
        technical.push(req)
      } else if (softKeywords.some((keyword) => lowerReq.includes(keyword))) {
        soft.push(req)
      } else if (expKeywords.some((keyword) => lowerReq.includes(keyword))) {
        experience.push(req)
      } else if (eduKeywords.some((keyword) => lowerReq.includes(keyword))) {
        education.push(req)
      } else {
        technical.push(req) // Default to technical
      }
    })

    return { technical, soft, experience, education }
  }

  private static extractSkills(text: string) {
    const skillsSection = text.match(
      /(?:Skills|Technologies|Tech Stack):\s*([^]*?)(?=\n\n|\nRequirements|\nBenefits|$)/i,
    )
    const preferredSection = text.match(/(?:Preferred|Nice to have|Bonus):\s*([^]*?)(?=\n\n|\nBenefits|$)/i)

    const parseSkills = (section: string | undefined): string[] => {
      if (!section) return []
      return section
        .split(/[,\n•-]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s.length < 50)
        .slice(0, 15)
    }

    return {
      required: parseSkills(skillsSection?.[1]),
      preferred: parseSkills(preferredSection?.[1]),
    }
  }

  private static extractBenefits(text: string): string[] | undefined {
    const benefitsSection = text.match(/(?:Benefits|Perks|What we offer):\s*([^]*?)(?=\n\n|$)/i)
    if (!benefitsSection) return undefined

    return benefitsSection[1]
      .split(/\n/)
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter((line) => line.length > 5)
      .slice(0, 10)
  }

  private static extractCompanyInfo(text: string): string | undefined {
    const companySection = text.match(
      /(?:About us|About the company|Company):\s*([^]*?)(?=\n\n|\nJob Description|\nResponsibilities|$)/i,
    )
    return companySection ? companySection[1].trim() : undefined
  }
}

export class CVJDMatcher {
  static matchCVToJD(cv: ParsedCV, jd: ParsedJD): MatchingResult {
    const skillsMatch = this.calculateSkillsMatch(cv.skills, [...jd.skills.required, ...jd.skills.preferred])
    const experienceMatch = this.calculateExperienceMatch(cv.experience, jd.requirements.experience)
    const educationMatch = this.calculateEducationMatch(cv.education, jd.requirements.education)

    const overallMatch = Math.round(skillsMatch * 0.5 + experienceMatch * 0.3 + educationMatch * 0.2)

    const matchedSkills = cv.skills.filter((skill) =>
      [...jd.skills.required, ...jd.skills.preferred].some(
        (reqSkill) =>
          skill.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(skill.toLowerCase()),
      ),
    )

    const missingSkills = jd.skills.required.filter(
      (reqSkill) =>
        !cv.skills.some(
          (skill) =>
            skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
            reqSkill.toLowerCase().includes(skill.toLowerCase()),
        ),
    )

    return {
      overallMatch,
      skillsMatch,
      experienceMatch,
      educationMatch,
      details: {
        matchedSkills,
        missingSkills,
        experienceGap: this.getExperienceGap(cv.experience, jd.basicInfo.experience),
        recommendations: this.generateRecommendations(cv, jd, overallMatch),
      },
    }
  }

  private static calculateSkillsMatch(cvSkills: string[], jdSkills: string[]): number {
    if (jdSkills.length === 0) return 100

    const matches = cvSkills.filter((cvSkill) =>
      jdSkills.some(
        (jdSkill) =>
          cvSkill.toLowerCase().includes(jdSkill.toLowerCase()) ||
          jdSkill.toLowerCase().includes(cvSkill.toLowerCase()),
      ),
    ).length

    return Math.round((matches / jdSkills.length) * 100)
  }

  private static calculateExperienceMatch(cvExperience: ParsedCV["experience"], jdExperience: string[]): number {
    if (jdExperience.length === 0) return 100

    // Simple heuristic: check if CV has relevant experience
    const hasRelevantExperience = cvExperience.length > 0
    const experienceYears = this.extractYearsFromExperience(cvExperience)

    return hasRelevantExperience ? Math.min(100, experienceYears * 20) : 0
  }

  private static calculateEducationMatch(cvEducation: ParsedCV["education"], jdEducation: string[]): number {
    if (jdEducation.length === 0) return 100

    const hasRelevantEducation = cvEducation.some((edu) =>
      jdEducation.some(
        (req) =>
          req.toLowerCase().includes(edu.degree.toLowerCase()) || req.toLowerCase().includes(edu.field.toLowerCase()),
      ),
    )

    return hasRelevantEducation ? 100 : 50 // 50% if no direct match but has education
  }

  private static extractYearsFromExperience(experience: ParsedCV["experience"]): number {
    // Simple calculation based on number of positions
    return Math.min(experience.length * 2, 10) // Assume 2 years per position, max 10
  }

  private static getExperienceGap(cvExperience: ParsedCV["experience"], jdExperience: string): string {
    const cvYears = this.extractYearsFromExperience(cvExperience)
    const requiredYearsMatch = jdExperience.match(/(\d+)\+?\s*years?/i)

    if (!requiredYearsMatch) return "Experience requirements unclear"

    const requiredYears = Number.parseInt(requiredYearsMatch[1])
    const gap = requiredYears - cvYears

    if (gap <= 0) return "Meets experience requirements"
    return `${gap} year(s) short of required experience`
  }

  private static generateRecommendations(cv: ParsedCV, jd: ParsedJD, overallMatch: number): string[] {
    const recommendations: string[] = []

    if (overallMatch < 70) {
      recommendations.push("Consider gaining more relevant experience in the required technologies")
    }

    if (cv.skills.length < jd.skills.required.length) {
      recommendations.push("Expand technical skill set to better match job requirements")
    }

    if (cv.certifications?.length === 0) {
      recommendations.push("Consider obtaining relevant certifications to strengthen profile")
    }

    if (!cv.projects || cv.projects.length < 2) {
      recommendations.push("Build more projects to demonstrate practical skills")
    }

    return recommendations
  }
}
