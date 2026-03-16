/**
 * normLookup.js  —  Shared Fitness Norm Utility
 * ─────────────────────────────────────────────
 * Import this module in any page that needs to classify a fitness test result.
 *
 * Lookup priority:
 *   1. studentNorms/{studentEmail}/{testKey}  (professor-set override)
 *   2. fitnessNorms/{testKey}_{gender}_{ageGroup}  (DB default)
 *   3. Hardcoded fallback (offline / first-run safety net)
 *
 * Usage:
 *   import { getNormCategory, getNormDoc } from './normLookup.js';
 *
 *   const category = await getNormCategory(db, {
 *       testName:     'Push-Up Test',
 *       result:       25,
 *       studentEmail: 'juan@umak.edu.ph',
 *       gender:       'male',
 *       age:          20,          // used to derive ageGroup
 *   });
 *   // → 'Good'
 */

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Maps a test name string to one of our canonical testKey values. */
export function resolveTestKey(testName = '') {
    const n = testName.toLowerCase();
    if (n.includes('push-up') || n.includes('pushup'))               return 'pushup';
    if (n.includes('curl-up') || n.includes('curl up'))              return 'curlup';
    if (n.includes('sit-and-reach') || n.includes('sit and reach'))  return 'sitreach';
    if (n.includes('step test') || n.includes('3-minute'))           return 'steptest';
    return null;   // skinfold / BMI / other — handled separately
}

/** Maps an age number → one of the four canonical age-group keys. */
export function resolveAgeGroup(age) {
    if (age == null || isNaN(age)) return '19-22';
    if (age <= 18) return '15-18';
    if (age <= 22) return '19-22';
    if (age <= 26) return '23-26';
    return '27-30';
}

/** Normalise a gender string to 'male' | 'female'. */
export function resolveGender(gender = '') {
    return gender.toLowerCase().startsWith('f') ? 'female' : 'male';
}

/** Pull a numeric value out of whatever format the result was stored as. */
export function extractNumericResult(result) {
    if (result == null) return 0;
    if (typeof result === 'number') return result;
    if (typeof result === 'object') {
        const v = result.value ?? result.result ?? result.score ??
                  result.count ?? result.repetitions ?? result.time ?? 0;
        return parseFloat(v) || 0;
    }
    const m = String(result).match(/(\d+\.?\d*)/);
    return m ? parseFloat(m[1]) : 0;
}

// ─── Hardcoded fallback norms (safety net — mirrors the DB seed) ──────────
const FALLBACK_NORMS = {
    pushup: {
        lowerIsBetter: false, unit: 'reps',
        male:   { '15-18': { Excellent:40,Good:31,Average:21,'Below Average':11 }, '19-22': { Excellent:38,Good:28,Average:18,'Below Average':9  }, '23-26': { Excellent:35,Good:25,Average:16,'Below Average':8  }, '27-30': { Excellent:32,Good:23,Average:14,'Below Average':6  } },
        female: { '15-18': { Excellent:25,Good:19,Average:13,'Below Average':7  }, '19-22': { Excellent:23,Good:17,Average:11,'Below Average':6  }, '23-26': { Excellent:20,Good:15,Average:9, 'Below Average':5  }, '27-30': { Excellent:18,Good:13,Average:8, 'Below Average':4  } },
    },
    curlup: {
        lowerIsBetter: false, unit: 'reps',
        male:   { '15-18': { Excellent:50,Good:41,Average:31,'Below Average':21 }, '19-22': { Excellent:47,Good:38,Average:28,'Below Average':19 }, '23-26': { Excellent:44,Good:35,Average:25,'Below Average':17 }, '27-30': { Excellent:40,Good:32,Average:22,'Below Average':15 } },
        female: { '15-18': { Excellent:45,Good:36,Average:26,'Below Average':16 }, '19-22': { Excellent:42,Good:34,Average:24,'Below Average':15 }, '23-26': { Excellent:39,Good:31,Average:21,'Below Average':13 }, '27-30': { Excellent:36,Good:28,Average:19,'Below Average':11 } },
    },
    sitreach: {
        lowerIsBetter: false, unit: 'cm',
        male:   { '15-18': { Excellent:38,  Good:33,  Average:26,  'Below Average':18   }, '19-22': { Excellent:37,  Good:32,  Average:25,  'Below Average':17   }, '23-26': { Excellent:35.5,Good:30.5,Average:23.5,'Below Average':15.5 }, '27-30': { Excellent:34,  Good:29,  Average:22,  'Below Average':14   } },
        female: { '15-18': { Excellent:39,  Good:34,  Average:27,  'Below Average':19   }, '19-22': { Excellent:38,  Good:33,  Average:26,  'Below Average':18   }, '23-26': { Excellent:37,  Good:32,  Average:25,  'Below Average':17   }, '27-30': { Excellent:36,  Good:31,  Average:24,  'Below Average':16   } },
    },
    steptest: {
        lowerIsBetter: true, unit: 'bpm',
        male:   { '15-18': { Excellent:84, Good:97, Average:108,'Below Average':118 }, '19-22': { Excellent:79, Good:89, Average:105,'Below Average':116 }, '23-26': { Excellent:80, Good:90, Average:106,'Below Average':117 }, '27-30': { Excellent:81, Good:91, Average:107,'Below Average':118 } },
        female: { '15-18': { Excellent:89, Good:103,Average:113,'Below Average':124 }, '19-22': { Excellent:85, Good:98, Average:109,'Below Average':118 }, '23-26': { Excellent:86, Good:99, Average:110,'Below Average':119 }, '27-30': { Excellent:88, Good:101,Average:112,'Below Average':121 } },
    },
};

/** Classify a numeric value against a threshold doc. */
function classifyValue(value, thresholds, lowerIsBetter) {
    const order = ['Excellent', 'Good', 'Average', 'Below Average'];
    for (const cat of order) {
        const t = thresholds[cat];
        if (t == null) continue;
        if (lowerIsBetter  && value <= t) return cat;
        if (!lowerIsBetter && value >= t) return cat;
    }
    return 'Poor';
}

// ─── In-memory cache (per page load) ─────────────────────────────────────
const _cache = new Map();

/**
 * Fetch a norm document.
 * Returns an object: { thresholds, lowerIsBetter, unit, source }
 *   source: 'student' | 'db' | 'fallback'
 */
export async function getNormDoc(db, { testKey, gender, ageGroup, studentEmail }) {
    const cacheKey = `${studentEmail}|${testKey}|${gender}|${ageGroup}`;
    if (_cache.has(cacheKey)) return _cache.get(cacheKey);

    const { doc: firestoreDoc, getDoc } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    // 1️⃣  Student-specific override
    if (studentEmail && testKey) {
        try {
            const studentNormRef = firestoreDoc(
                db, 'studentNorms', studentEmail, 'tests', testKey
            );
            const snap = await getDoc(studentNormRef);
            if (snap.exists()) {
                const data = snap.data();
                const result = {
                    thresholds:    data.thresholds,
                    lowerIsBetter: data.lowerIsBetter ?? false,
                    unit:          data.unit ?? 'reps',
                    source:        'student',
                };
                _cache.set(cacheKey, result);
                return result;
            }
        } catch (e) {
            console.warn('[normLookup] Could not read studentNorms:', e.message);
        }
    }

    // 2️⃣  DB default
    if (testKey && gender && ageGroup) {
        try {
            const normRef = firestoreDoc(db, 'fitnessNorms', `${testKey}_${gender}_${ageGroup}`);
            const snap = await getDoc(normRef);
            if (snap.exists()) {
                const data = snap.data();
                const result = {
                    thresholds:    data.thresholds,
                    lowerIsBetter: data.lowerIsBetter ?? false,
                    unit:          data.unit ?? 'reps',
                    source:        'db',
                };
                _cache.set(cacheKey, result);
                return result;
            }
        } catch (e) {
            console.warn('[normLookup] Could not read fitnessNorms:', e.message);
        }
    }

    // 3️⃣  Hardcoded fallback
    const fb = FALLBACK_NORMS[testKey]?.[gender]?.[ageGroup];
    if (fb) {
        const result = {
            thresholds:    fb,
            lowerIsBetter: FALLBACK_NORMS[testKey].lowerIsBetter,
            unit:          FALLBACK_NORMS[testKey].unit,
            source:        'fallback',
        };
        _cache.set(cacheKey, result);
        return result;
    }

    return null;
}

/**
 * Main entry-point.
 * Returns { category, source, normDoc } or null if test is not norm-based.
 *
 * @param {object} firestoreDb   Firestore db instance
 * @param {object} opts
 *   testName      {string}
 *   result        {any}         raw result value
 *   studentEmail  {string}
 *   gender        {string}      'male' | 'female' (or raw string)
 *   age           {number}      student age in years
 */
export async function getNormCategory(firestoreDb, {
    testName, result, studentEmail, gender, age
}) {
    const testKey  = resolveTestKey(testName);
    if (!testKey) return null;                        // not a norm-based test

    const ageGroup  = resolveAgeGroup(age);
    const genderKey = resolveGender(gender);
    const value     = extractNumericResult(result);

    const normDoc = await getNormDoc(firestoreDb, {
        testKey,
        gender:       genderKey,
        ageGroup,
        studentEmail,
    });

    if (!normDoc) return null;

    const category = classifyValue(value, normDoc.thresholds, normDoc.lowerIsBetter);
    return { category, source: normDoc.source, normDoc };
}

/**
 * Save a professor-defined norm override for a specific student + test.
 *
 * @param {object} firestoreDb
 * @param {string} studentEmail
 * @param {string} testKey         'pushup' | 'curlup' | 'sitreach' | 'steptest'
 * @param {object} thresholds      { Excellent, Good, Average, 'Below Average' }
 * @param {object} meta            { lowerIsBetter, unit, setProfessorEmail }
 */
export async function saveStudentNorm(firestoreDb, studentEmail, testKey, thresholds, meta = {}) {
    const { doc: firestoreDoc, setDoc, serverTimestamp } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const ref = firestoreDoc(firestoreDb, 'studentNorms', studentEmail, 'tests', testKey);
    await setDoc(ref, {
        testKey,
        thresholds,
        lowerIsBetter:      meta.lowerIsBetter ?? false,
        unit:               meta.unit ?? 'reps',
        setProfessorEmail:  meta.setProfessorEmail ?? '',
        updatedAt:          serverTimestamp(),
        isCustom:           true,
    });

    // Bust cache for this student + test
    // (all gender/ageGroup combos — student norm ignores those)
    for (const [k] of _cache) {
        if (k.startsWith(`${studentEmail}|${testKey}|`)) _cache.delete(k);
    }
}

/**
 * Delete a student norm override (revert to DB default).
 */
export async function deleteStudentNorm(firestoreDb, studentEmail, testKey) {
    const { doc: firestoreDoc, deleteDoc } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const ref = firestoreDoc(firestoreDb, 'studentNorms', studentEmail, 'tests', testKey);
    await deleteDoc(ref);

    for (const [k] of _cache) {
        if (k.startsWith(`${studentEmail}|${testKey}|`)) _cache.delete(k);
    }
}

/**
 * Fetch all custom norms set for a student (for display in the UI).
 * Returns Map<testKey, normData>
 */
export async function getStudentCustomNorms(firestoreDb, studentEmail) {
    const { collection, getDocs } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const col  = collection(firestoreDb, 'studentNorms', studentEmail, 'tests');
    const snap = await getDocs(col);
    const map  = new Map();
    snap.forEach(d => map.set(d.id, d.data()));
    return map;
}

// ─── Category helpers (UI) ────────────────────────────────────────────────
export const CATEGORY_ORDER = { Excellent:5, Good:4, Average:3, 'Below Average':2, Poor:1 };

export function getOverallCategory(categories = []) {
    if (!categories.length) return 'Average';
    const avg = categories.reduce((s, c) => s + (CATEGORY_ORDER[c] || 3), 0) / categories.length;
    if (avg >= 4.5) return 'Excellent';
    if (avg >= 3.5) return 'Good';
    if (avg >= 2.5) return 'Average';
    if (avg >= 1.5) return 'Below Average';
    return 'Poor';
}

export function getCategoryBadgeClass(category) {
    switch (category) {
        case 'Excellent':     return 'category-excellent';
        case 'Good':          return 'category-good';
        case 'Average':       return 'category-average';
        case 'Below Average': return 'category-below-average';
        case 'Poor':          return 'category-poor';
        default:              return 'category-default';
    }
}

export function getCategoryIcon(category) {
    return { Excellent:'⭐', Good:'👍', Average:'📊', 'Below Average':'📉', Poor:'⚠️' }[category] || '—';
}

export function renderCategoryBadge(category) {
    if (!category || category === 'No Grades')
        return '<span class="category-badge category-default">— No Grades</span>';
    return `<span class="category-badge ${getCategoryBadgeClass(category)}">${getCategoryIcon(category)} ${category}</span>`;
}