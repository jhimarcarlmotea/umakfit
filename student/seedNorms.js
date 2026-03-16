/**
 * seedNorms.js
 * Run this ONCE in your browser console (or as a module script on any
 * authenticated professor/admin page) to populate the default fitness
 * norms into Firestore.
 *
 * Collection: fitnessNorms
 * Document ID pattern: {testKey}_{gender}_{ageGroup}
 *   e.g.  pushup_male_19-22
 *
 * Each document:
 * {
 *   testKey:   "pushup" | "curlup" | "sitreach" | "steptest"
 *   testName:  human-readable label
 *   gender:    "male" | "female"
 *   ageGroup:  "15-18" | "19-22" | "23-26" | "27-30"
 *   thresholds: {
 *     Excellent:     number,   // ≥ this (or ≤ for steptest)
 *     Good:          number,
 *     Average:       number,
 *     "Below Average": number
 *     // anything below Below Average → Poor
 *   }
 *   lowerIsBetter: boolean    // true for step test (heart rate)
 *   unit: string              // "reps" | "cm" | "bpm"
 * }
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAgaLunqEf2gs6dSpF_sz1hV5XQ5Wm52jo",
    authDomain: "umakfit-e3b1d.firebaseapp.com",
    projectId: "umakfit-e3b1d",
    storageBucket: "umakfit-e3b1d.appspot.com",
    messagingSenderId: "276569891504",
    appId: "1:276569891504:web:39b1732b519f4d8b785175"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Raw norm tables ───────────────────────────────────────────────────────
const NORMS = {
    pushup: {
        label: 'Push-Up Test',
        unit: 'reps',
        lowerIsBetter: false,
        male: {
            '15-18': { Excellent: 40, Good: 31, Average: 21, 'Below Average': 11 },
            '19-22': { Excellent: 38, Good: 28, Average: 18, 'Below Average': 9  },
            '23-26': { Excellent: 35, Good: 25, Average: 16, 'Below Average': 8  },
            '27-30': { Excellent: 32, Good: 23, Average: 14, 'Below Average': 6  },
        },
        female: {
            '15-18': { Excellent: 25, Good: 19, Average: 13, 'Below Average': 7  },
            '19-22': { Excellent: 23, Good: 17, Average: 11, 'Below Average': 6  },
            '23-26': { Excellent: 20, Good: 15, Average: 9,  'Below Average': 5  },
            '27-30': { Excellent: 18, Good: 13, Average: 8,  'Below Average': 4  },
        },
    },
    curlup: {
        label: 'Curl-Up Test',
        unit: 'reps',
        lowerIsBetter: false,
        male: {
            '15-18': { Excellent: 50, Good: 41, Average: 31, 'Below Average': 21 },
            '19-22': { Excellent: 47, Good: 38, Average: 28, 'Below Average': 19 },
            '23-26': { Excellent: 44, Good: 35, Average: 25, 'Below Average': 17 },
            '27-30': { Excellent: 40, Good: 32, Average: 22, 'Below Average': 15 },
        },
        female: {
            '15-18': { Excellent: 45, Good: 36, Average: 26, 'Below Average': 16 },
            '19-22': { Excellent: 42, Good: 34, Average: 24, 'Below Average': 15 },
            '23-26': { Excellent: 39, Good: 31, Average: 21, 'Below Average': 13 },
            '27-30': { Excellent: 36, Good: 28, Average: 19, 'Below Average': 11 },
        },
    },
    sitreach: {
        label: 'Sit-and-Reach Test',
        unit: 'cm',
        lowerIsBetter: false,
        male: {
            '15-18': { Excellent: 38,   Good: 33,   Average: 26,   'Below Average': 18   },
            '19-22': { Excellent: 37,   Good: 32,   Average: 25,   'Below Average': 17   },
            '23-26': { Excellent: 35.5, Good: 30.5, Average: 23.5, 'Below Average': 15.5 },
            '27-30': { Excellent: 34,   Good: 29,   Average: 22,   'Below Average': 14   },
        },
        female: {
            '15-18': { Excellent: 39, Good: 34, Average: 27, 'Below Average': 19 },
            '19-22': { Excellent: 38, Good: 33, Average: 26, 'Below Average': 18 },
            '23-26': { Excellent: 37, Good: 32, Average: 25, 'Below Average': 17 },
            '27-30': { Excellent: 36, Good: 31, Average: 24, 'Below Average': 16 },
        },
    },
    steptest: {
        label: '3-Minute Step Test',
        unit: 'bpm',
        lowerIsBetter: true,   // lower heart rate = better
        male: {
            '15-18': { Excellent: 84,  Good: 97,  Average: 108, 'Below Average': 118 },
            '19-22': { Excellent: 79,  Good: 89,  Average: 105, 'Below Average': 116 },
            '23-26': { Excellent: 80,  Good: 90,  Average: 106, 'Below Average': 117 },
            '27-30': { Excellent: 81,  Good: 91,  Average: 107, 'Below Average': 118 },
        },
        female: {
            '15-18': { Excellent: 89,  Good: 103, Average: 113, 'Below Average': 124 },
            '19-22': { Excellent: 85,  Good: 98,  Average: 109, 'Below Average': 118 },
            '23-26': { Excellent: 86,  Good: 99,  Average: 110, 'Below Average': 119 },
            '27-30': { Excellent: 88,  Good: 101, Average: 112, 'Below Average': 121 },
        },
    },
};

// ─── Seed ─────────────────────────────────────────────────────────────────
async function seedNorms() {
    const genders    = ['male', 'female'];
    const ageGroups  = ['15-18', '19-22', '23-26', '27-30'];
    let count = 0;

    for (const [testKey, testData] of Object.entries(NORMS)) {
        for (const gender of genders) {
            for (const ageGroup of ageGroups) {
                const docId = `${testKey}_${gender}_${ageGroup}`;
                await setDoc(doc(db, 'fitnessNorms', docId), {
                    testKey,
                    testName:       testData.label,
                    gender,
                    ageGroup,
                    thresholds:     testData[gender][ageGroup],
                    lowerIsBetter:  testData.lowerIsBetter,
                    unit:           testData.unit,
                    updatedAt:      new Date().toISOString(),
                    isDefault:      true,
                });
                count++;
                console.log(`✅ Seeded: ${docId}`);
            }
        }
    }
    console.log(`\n🎉 Done! Seeded ${count} norm documents into fitnessNorms collection.`);
}

seedNorms().catch(console.error);
