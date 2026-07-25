import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { MOCK_DOMAINS, MOCK_DIMENSIONS, MOCK_GAPS, MOCK_SIMULATIONS, MOCK_STUDENTS, MOCK_STAFF, MOCK_ATTENDANCE, MOCK_COMMUNICATIONS } from '../store';

export const seedDatabase = async () => {
  try {
    const domainsSnap = await getDocs(collection(db, 'domains'));
    if (!domainsSnap.empty) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Seeding database...');
    const batch = writeBatch(db);

    MOCK_DOMAINS.forEach(domain => {
      const ref = doc(db, 'domains', domain.id);
      batch.set(ref, domain);
    });

    MOCK_DIMENSIONS.forEach(dimension => {
      const ref = doc(db, 'dimensions', dimension.id);
      batch.set(ref, dimension);
    });

    MOCK_GAPS.forEach(gap => {
      const ref = doc(db, 'gaps', gap.id);
      batch.set(ref, gap);
    });

    MOCK_SIMULATIONS.forEach(sim => {
      const ref = doc(db, 'simulations', sim.id);
      batch.set(ref, sim);
    });

    MOCK_STUDENTS.forEach(student => {
      const ref = doc(db, 'students', student.id);
      batch.set(ref, student);
    });

    MOCK_STAFF.forEach(staff => {
      const ref = doc(db, 'staff', staff.id);
      batch.set(ref, staff);
    });

    MOCK_ATTENDANCE.forEach(att => {
      const ref = doc(db, 'attendance', att.id);
      batch.set(ref, att);
    });

    MOCK_COMMUNICATIONS.forEach(com => {
      const ref = doc(db, 'communications', com.id);
      batch.set(ref, com);
    });

    await batch.commit();
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
