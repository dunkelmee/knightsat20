// Canonical high-school year levels and their section names, used by the
// Edit Profile form and the Directory's section filter. sectionHs is the
// original single-section field, repurposed to hold the 4th Year section
// rather than adding a fourth "sectionYear4" column.
export type SectionFieldKey = 'sectionYear1' | 'sectionYear2' | 'sectionYear3' | 'sectionHs';

export const YEAR_SECTIONS: {
  key: SectionFieldKey;
  label: string;
  short: string;
  options: string[];
}[] = [
  { key: 'sectionYear1', label: '1st Year', short: '1st', options: ['Archimedes', 'Copernicus', 'Galileo', 'Pascal'] },
  { key: 'sectionYear2', label: '2nd Year', short: '2nd', options: ['Darwin', 'Hooke', 'Mendel', 'Pasteur'] },
  { key: 'sectionYear3', label: '3rd Year', short: '3rd', options: ['Becquerel', 'Lavoisier', 'Roentgen', 'Rutherford'] },
  { key: 'sectionHs', label: '4th Year', short: '4th', options: ['Einstein', 'Faraday', 'Fermi', 'Newton'] },
];
