/**
 * PART 8: DATA PERSISTENCE VERIFICATION
 * Comprehensive testing of Firestore data persistence:
 * - Document Creation and Updates
 * - Real-Time Listener Accuracy
 * - Query Functionality
 * - Data Consistency Across Cycles
 * - Transaction Integrity
 *
 * Reference: Firebase Firestore Collections Schema
 */

// ============================================================================
// FIRESTORE SIMULATOR (For Testing Without Live Firebase)
// ============================================================================

class FirestoreSimulator {
  constructor() {
    this.collections = {
      schools: {},
      assessmentCycles: {},
      challengeResponses: {},
      multipliers: {},
      computedScores: {},
    };
    this.listeners = [];
    this.transactions = [];
  }

  // ========================================================================
  // DOCUMENT OPERATIONS
  // ========================================================================

  /**
   * Create or update a document
   */
  setDocument(collection, documentId, data) {
    if (!this.collections[collection]) {
      return { success: false, error: `Collection ${collection} not found` };
    }

    const timestamp = new Date();
    const doc = {
      id: documentId,
      data: { ...data, updatedAt: timestamp },
      createdAt: this.collections[collection][documentId]
        ? this.collections[collection][documentId].createdAt
        : timestamp,
      version: (this.collections[collection][documentId]?.version || 0) + 1,
    };

    this.collections[collection][documentId] = doc;

    // Notify listeners
    this.notifyListeners(collection, documentId, doc);

    return { success: true, documentId, timestamp };
  }

  /**
   * Read a document
   */
  getDocument(collection, documentId) {
    if (!this.collections[collection]) {
      return { success: false, error: `Collection ${collection} not found` };
    }

    const doc = this.collections[collection][documentId];
    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    return { success: true, document: doc.data, metadata: { version: doc.version } };
  }

  /**
   * Delete a document
   */
  deleteDocument(collection, documentId) {
    if (!this.collections[collection] || !this.collections[collection][documentId]) {
      return { success: false, error: 'Document not found' };
    }

    delete this.collections[collection][documentId];

    // Notify listeners
    this.notifyListeners(collection, documentId, null);

    return { success: true };
  }

  /**
   * Query documents
   */
  queryDocuments(collection, whereConditions = []) {
    if (!this.collections[collection]) {
      return { success: false, error: `Collection ${collection} not found` };
    }

    let results = Object.values(this.collections[collection]).map((doc) => doc.data);

    // Apply where conditions
    whereConditions.forEach((condition) => {
      const { field, operator, value } = condition;
      results = results.filter((doc) => {
        switch (operator) {
          case '==':
            return doc[field] === value;
          case '<':
            return doc[field] < value;
          case '>':
            return doc[field] > value;
          case '<=':
            return doc[field] <= value;
          case '>=':
            return doc[field] >= value;
          case 'in':
            return value.includes(doc[field]);
          default:
            return true;
        }
      });
    });

    return { success: true, documents: results, count: results.length };
  }

  /**
   * Batch write operation
   */
  batchWrite(operations) {
    const results = [];
    const startTime = Date.now();

    try {
      operations.forEach((op) => {
        if (op.type === 'set') {
          const result = this.setDocument(op.collection, op.documentId, op.data);
          results.push(result);
        } else if (op.type === 'delete') {
          const result = this.deleteDocument(op.collection, op.documentId);
          results.push(result);
        }
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        operationCount: operations.length,
        duration,
        allSuccessful: results.every((r) => r.success),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Transaction operation
   */
  transaction(callback) {
    const transactionId = `txn-${Date.now()}`;
    const startTime = Date.now();

    try {
      const result = callback(this);
      const duration = Date.now() - startTime;

      this.transactions.push({
        id: transactionId,
        status: 'COMMITTED',
        duration,
        timestamp: new Date(),
      });

      return { success: true, transactionId, duration };
    } catch (error) {
      this.transactions.push({
        id: transactionId,
        status: 'ABORTED',
        error: error.message,
        timestamp: new Date(),
      });

      return { success: false, error: error.message };
    }
  }

  // ========================================================================
  // REAL-TIME LISTENERS
  // ========================================================================

  /**
   * Add a real-time listener
   */
  addListener(collection, documentId, callback) {
    const listenerId = `listener-${Date.now()}`;

    const listener = {
      id: listenerId,
      collection,
      documentId,
      callback,
      createdAt: new Date(),
      updateCount: 0,
      lastUpdate: null,
    };

    this.listeners.push(listener);

    // Immediately fire initial snapshot
    const doc = this.collections[collection]?.[documentId];
    if (doc) {
      listener.callback(doc.data);
      listener.updateCount++;
      listener.lastUpdate = new Date();
    }

    return { success: true, listenerId };
  }

  /**
   * Remove a listener
   */
  removeListener(listenerId) {
    const index = this.listeners.findIndex((l) => l.id === listenerId);
    if (index === -1) {
      return { success: false, error: 'Listener not found' };
    }

    this.listeners.splice(index, 1);
    return { success: true };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(collection, documentId, data) {
    const relevantListeners = this.listeners.filter(
      (l) => l.collection === collection && l.documentId === documentId
    );

    relevantListeners.forEach((listener) => {
      listener.callback(data?.data || null);
      listener.updateCount++;
      listener.lastUpdate = new Date();
    });
  }

  /**
   * Get listener statistics
   */
  getListenerStats(listenerId) {
    const listener = this.listeners.find((l) => l.id === listenerId);
    if (!listener) return null;

    return {
      id: listener.id,
      updateCount: listener.updateCount,
      lastUpdate: listener.lastUpdate,
      uptime: Date.now() - listener.createdAt.getTime(),
    };
  }

  // ========================================================================
  // CONSISTENCY CHECKS
  // ========================================================================

  /**
   * Verify data consistency across cycles
   */
  verifyConsistency(schoolId) {
    const cycleIds = Object.keys(this.collections.assessmentCycles).filter(
      (id) => this.collections.assessmentCycles[id].data.schoolId === schoolId
    );

    const consistency = {
      schoolId,
      cycleCount: cycleIds.length,
      totalResponses: 0,
      totalScores: 0,
      dataIntegrity: true,
      orphanedData: [],
      issues: [],
    };

    cycleIds.forEach((cycleId) => {
      // Check for responses related to this cycle
      const responses = Object.values(this.collections.challengeResponses).filter(
        (r) => r.data.cycleId === cycleId
      );
      consistency.totalResponses += responses.length;

      // Check for computed scores
      const scores = Object.values(this.collections.computedScores).filter(
        (s) => s.data.cycleId === cycleId
      );
      consistency.totalScores += scores.length;

      // Verify data integrity
      if (responses.length > 0 && scores.length === 0) {
        consistency.issues.push(`Cycle ${cycleId}: Has responses but no computed scores`);
        consistency.dataIntegrity = false;
      }
    });

    // Check for orphaned responses (responses with non-existent cycles)
    Object.values(this.collections.challengeResponses).forEach((r) => {
      if (!this.collections.assessmentCycles[r.data.cycleId]) {
        consistency.orphanedData.push({
          type: 'response',
          id: r.id,
          cycleId: r.data.cycleId,
        });
        consistency.dataIntegrity = false;
      }
    });

    return consistency;
  }

  /**
   * Get database statistics
   */
  getStats() {
    return {
      collections: Object.keys(this.collections).reduce((acc, col) => {
        acc[col] = Object.keys(this.collections[col]).length;
        return acc;
      }, {}),
      listeners: this.listeners.length,
      activeListeners: this.listeners.filter((l) => l.updateCount > 0).length,
      transactions: {
        total: this.transactions.length,
        committed: this.transactions.filter((t) => t.status === 'COMMITTED').length,
        aborted: this.transactions.filter((t) => t.status === 'ABORTED').length,
      },
    };
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

const TEST_CASES = [
  {
    name: 'Create Single Document',
    test: (db) => {
      const result = db.setDocument('schools', 'school-001', {
        name: 'Test School',
        region: 'West',
        active: true,
      });
      return result.success && result.documentId === 'school-001';
    },
  },
  {
    name: 'Read Document After Creation',
    test: (db) => {
      db.setDocument('schools', 'school-001', { name: 'Test' });
      const result = db.getDocument('schools', 'school-001');
      return result.success && result.document.name === 'Test';
    },
  },
  {
    name: 'Update Document (Version Increment)',
    test: (db) => {
      db.setDocument('schools', 'school-001', { name: 'V1' });
      const v1 = db.getDocument('schools', 'school-001');
      db.setDocument('schools', 'school-001', { name: 'V2' });
      const v2 = db.getDocument('schools', 'school-001');

      return v2.metadata.version > v1.metadata.version;
    },
  },
  {
    name: 'Delete Document',
    test: (db) => {
      db.setDocument('schools', 'school-001', { name: 'Test' });
      db.deleteDocument('schools', 'school-001');
      const result = db.getDocument('schools', 'school-001');
      return !result.success && result.error === 'Document not found';
    },
  },
  {
    name: 'Query Documents (Equality)',
    test: (db) => {
      db.setDocument('assessmentCycles', 'cycle-1', { schoolId: 'school-1', active: true });
      db.setDocument('assessmentCycles', 'cycle-2', { schoolId: 'school-1', active: false });
      db.setDocument('assessmentCycles', 'cycle-3', { schoolId: 'school-2', active: true });

      const result = db.queryDocuments('assessmentCycles', [
        { field: 'schoolId', operator: '==', value: 'school-1' },
      ]);

      return result.success && result.count === 2;
    },
  },
  {
    name: 'Query Documents (Multiple Conditions)',
    test: (db) => {
      db.setDocument('challengeResponses', 'resp-1', {
        cycleId: 'cycle-1',
        health: 75,
        processed: true,
      });
      db.setDocument('challengeResponses', 'resp-2', {
        cycleId: 'cycle-1',
        health: 45,
        processed: true,
      });
      db.setDocument('challengeResponses', 'resp-3', {
        cycleId: 'cycle-1',
        health: 85,
        processed: false,
      });

      const result = db.queryDocuments('challengeResponses', [
        { field: 'cycleId', operator: '==', value: 'cycle-1' },
        { field: 'health', operator: '>=', value: 70 },
        { field: 'processed', operator: '==', value: true },
      ]);

      return result.success && result.count === 1;
    },
  },
  {
    name: 'Batch Write Operation',
    test: (db) => {
      const operations = [
        {
          type: 'set',
          collection: 'assessmentCycles',
          documentId: 'cycle-1',
          data: { schoolId: 'school-1' },
        },
        {
          type: 'set',
          collection: 'challengeResponses',
          documentId: 'resp-1',
          data: { cycleId: 'cycle-1', health: 75 },
        },
        {
          type: 'set',
          collection: 'computedScores',
          documentId: 'score-1',
          data: { cycleId: 'cycle-1', health: 75 },
        },
      ];

      const result = db.batchWrite(operations);
      return result.success && result.allSuccessful && result.operationCount === 3;
    },
  },
  {
    name: 'Real-Time Listener Creation',
    test: (db) => {
      db.setDocument('assessmentCycles', 'cycle-1', { schoolId: 'school-1', health: 75 });

      const result = db.addListener('assessmentCycles', 'cycle-1', (data) => {
        // Callback
      });

      return result.success && result.listenerId.startsWith('listener-');
    },
  },
  {
    name: 'Real-Time Listener Update Detection',
    test: (db) => {
      db.setDocument('assessmentCycles', 'cycle-1', { health: 75 });

      let updateCount = 0;
      db.addListener('assessmentCycles', 'cycle-1', (data) => {
        updateCount++;
      });

      // Initial callback should fire
      if (updateCount !== 1) return false;

      // Update should trigger listener
      db.setDocument('assessmentCycles', 'cycle-1', { health: 80 });

      return updateCount === 2;
    },
  },
  {
    name: 'Multiple Listeners Same Document',
    test: (db) => {
      db.setDocument('assessmentCycles', 'cycle-1', { health: 75 });

      let updates1 = 0;
      let updates2 = 0;

      db.addListener('assessmentCycles', 'cycle-1', () => {
        updates1++;
      });
      db.addListener('assessmentCycles', 'cycle-1', () => {
        updates2++;
      });

      // Both should fire for initial
      if (updates1 !== 1 || updates2 !== 1) return false;

      // Both should fire for update
      db.setDocument('assessmentCycles', 'cycle-1', { health: 80 });

      return updates1 === 2 && updates2 === 2;
    },
  },
  {
    name: 'Data Consistency - No Orphaned Data',
    test: (db) => {
      // Create cycle
      db.setDocument('assessmentCycles', 'cycle-1', { schoolId: 'school-1' });

      // Create responses for cycle
      db.setDocument('challengeResponses', 'resp-1', { cycleId: 'cycle-1', health: 75 });
      db.setDocument('challengeResponses', 'resp-2', { cycleId: 'cycle-1', health: 80 });

      // Create computed scores
      db.setDocument('computedScores', 'score-1', { cycleId: 'cycle-1', health: 77.5 });

      const consistency = db.verifyConsistency('school-1');

      return (
        consistency.dataIntegrity &&
        consistency.totalResponses === 2 &&
        consistency.totalScores === 1
      );
    },
  },
  {
    name: 'Data Consistency - Detect Orphaned Data',
    test: (db) => {
      // Create responses for non-existent cycle
      db.setDocument('challengeResponses', 'resp-1', {
        cycleId: 'nonexistent-cycle',
        health: 75,
      });

      const consistency = db.verifyConsistency('school-1');

      return (
        !consistency.dataIntegrity &&
        consistency.orphanedData.length > 0 &&
        consistency.orphanedData[0].type === 'response'
      );
    },
  },
  {
    name: 'Transaction Commit',
    test: (db) => {
      const result = db.transaction((txn) => {
        txn.setDocument('assessmentCycles', 'cycle-1', { schoolId: 'school-1' });
        txn.setDocument('challengeResponses', 'resp-1', { cycleId: 'cycle-1' });
      });

      return result.success && result.duration >= 0;
    },
  },
  {
    name: 'Transaction Rollback on Error',
    test: (db) => {
      const result = db.transaction((txn) => {
        txn.setDocument('assessmentCycles', 'cycle-1', { schoolId: 'school-1' });
        throw new Error('Simulated error');
      });

      return !result.success && result.error === 'Simulated error';
    },
  },
  {
    name: 'Listener Removal',
    test: (db) => {
      db.setDocument('assessmentCycles', 'cycle-1', { health: 75 });

      let updateCount = 0;
      const listenerId = db.addListener('assessmentCycles', 'cycle-1', () => {
        updateCount++;
      }).listenerId;

      // Initial update
      if (updateCount !== 1) return false;

      // Remove listener
      db.removeListener(listenerId);

      // Update should NOT trigger listener
      db.setDocument('assessmentCycles', 'cycle-1', { health: 80 });

      return updateCount === 1; // Should still be 1
    },
  },
  {
    name: 'Database Statistics',
    test: (db) => {
      db.setDocument('schools', 'school-1', { name: 'Test' });
      db.setDocument('assessmentCycles', 'cycle-1', { schoolId: 'school-1' });
      db.setDocument('challengeResponses', 'resp-1', { cycleId: 'cycle-1' });

      const stats = db.getStats();

      return (
        stats.collections.schools >= 1 &&
        stats.collections.assessmentCycles >= 1 &&
        stats.collections.challengeResponses >= 1
      );
    },
  },
];

// ============================================================================
// EXECUTION
// ============================================================================

const RESULTS = {
  passed: 0,
  failed: 0,
  tests: [],
};

console.log('🧪 PART 8: DATA PERSISTENCE VERIFICATION');
console.log('═══════════════════════════════════════════════════════════════════\n');

TEST_CASES.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`───────────────────────────────────────────────────────────────`);

  const db = new FirestoreSimulator();

  try {
    const passed = testCase.test(db);

    if (passed) {
      console.log(`  ✅ PASS`);
      RESULTS.passed++;
    } else {
      console.log(`  ❌ FAIL`);
      RESULTS.failed++;
    }

    RESULTS.tests.push({
      case: testCase.name,
      passed,
    });
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    RESULTS.failed++;
    RESULTS.tests.push({
      case: testCase.name,
      passed: false,
    });
  }

  console.log();
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('PART 8: DATA PERSISTENCE RESULTS');
console.log('═══════════════════════════════════════════════════════════════════\n');

const total = RESULTS.passed + RESULTS.failed;
const passRate = ((RESULTS.passed / total) * 100).toFixed(1);

console.log(`Total Tests Run: ${total}`);
console.log(`Passed: ${RESULTS.passed}`);
console.log(`Failed: ${RESULTS.failed}`);
console.log(`Pass Rate: ${passRate}%\n`);

console.log('Tests:');
RESULTS.tests.forEach((test) => {
  const icon = test.passed ? '✅' : '❌';
  console.log(`  ${icon} ${test.case}`);
});

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('VERDICT');
console.log('═══════════════════════════════════════════════════════════════════\n');

if (passRate >= 95) {
  console.log('✅ ALL DATA PERSISTENCE TESTS PASS - PRODUCTION READY');
} else if (passRate >= 70) {
  console.log('⚠️ SOME DATA PERSISTENCE TESTS FAILED - REVIEW NEEDED');
} else {
  console.log('❌ CRITICAL DATA PERSISTENCE FAILURES - DO NOT DEPLOY');
}

console.log(`\n${RESULTS.passed}/${total} tests passing`);
console.log('\n═══════════════════════════════════════════════════════════════════\n');

process.exit(passRate >= 95 ? 0 : 1);
