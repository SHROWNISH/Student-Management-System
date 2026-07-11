import React, { useState, useEffect } from 'react';

function App() {
  // Initialize state from LocalStorage so data persists on refresh
  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem('sms_students');
    return savedStudents ? JSON.parse(savedStudents) : [
      
      { id: 1, rollNo: "101", name: "Name1", marks: "90" },
       { id: 2, rollNo: "102", name: "Name2", marks: "90" },
       { id: 3, rollNo: "103", name: "Name3", marks: "90" }
    ];
  });

  // State for form fields
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [marks, setMarks] = useState('');
  
  // State for advanced filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  
  // State for form errors
  const [error, setError] = useState('');

  // Sync state with LocalStorage whenever the student array changes
  useEffect(() => {
    localStorage.setItem('sms_students', JSON.stringify(students));
  }, [students]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rollNo.trim() || !name.trim() || !marks.trim()) {
      setError('All fields are required!');
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      setError('Student name should contain only alphabets.');
      return;
}

    if (students.some(student => student.rollNo.toLowerCase() === rollNo.trim().toLowerCase())) {
      setError('This Roll Number already exists in the system.');
      return;
    }

    const numericMarks = Number(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > 100) {
      setError('Marks must be a valid number between 0 and 100.');
      return;
    }

    const newStudent = {
      id: Date.now(),
      rollNo: rollNo.trim(),
      name: name.trim(),
      marks: marks.trim()
    };

    setStudents([...students, newStudent]);
    setRollNo('');
    setName('');
    setMarks('');
    setError(''); 
  };

  // Handle record deletion
  const handleDelete = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  // Clear all records at once
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all student records?")) {
      setStudents([]);
    }
  };

  // Helper function to determine automatic Letter Grades
  const calculateGrade = (score) => {
    const s = Number(score);
    if (s >= 90) return { label: 'A+', class: 'grade-a' };
    if (s >= 75) return { label: 'A', class: 'grade-a' };
    if (s >= 60) return { label: 'B', class: 'grade-b' };
    if (s >= 40) return { label: 'C', class: 'grade-c' };
    return { label: 'F', class: 'grade-f' };
  };

  // Feature: Export table data to an external CSV file
  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    // Define headers and map data rows
    const headers = ['Roll Number,Name,Marks,Grade\n'];
    const rows = students.map(s => `"${s.rollNo}","${s.name}",${s.marks},"${calculateGrade(s.marks).label}"\n`);
    
    // Create blob object and trigger download link browser side
    const blob = new Blob([headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Computed Metrics Features
  const totalStudents = students.length;
  const averageMarks = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + Number(s.marks), 0) / totalStudents).toFixed(1) 
    : 0;
  const highestScore = totalStudents > 0 
    ? Math.max(...students.map(s => Number(s.marks))) 
    : 0;

  // Filter pipeline: Search + Pass/Fail Tabs
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isPassing = Number(student.marks) >= 40;
    if (statusFilter === 'pass') return matchesSearch && isPassing;
    if (statusFilter === 'fail') return matchesSearch && !isPassing;
    return matchesSearch;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎓 Student Dashboard Pro</h1>
        <p className="subtitle">System Record Database & Live Metrics</p>
      </header>

      {/* Analytics Widget Bar */}
      <div className="analytics-bar">
        <div className="stat-card">
          <span className="stat-title">Total Students</span>
          <span className="stat-value">{totalStudents}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Class Average</span>
          <span className="stat-value">{averageMarks}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Highest Score</span>
          <span className="stat-value text-accent">{highestScore}%</span>
        </div>
      </div>

      <main className="main-content">
        {/* Left Control Panel: Form */}
        <section className="form-section">
          <div className="section-header-inline">
            <h2>Registration Form</h2>
            {totalStudents > 0 && (
              <button onClick={handleClearAll} className="btn-clear-all">Clear All</button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="student-form">
            
            {error && <div className="error-badge">{error}</div>}

            <div className="form-group">
              <label>Roll Number</label>
              <input
                type="text"
                placeholder="e.g., 23CS01"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Student Full Name</label>
              <input
                type="text"
                placeholder="e.g., Jane Doe"
                value={name}
                onChange={(e) => {const value = e.target.value;
                if (/^[A-Za-z\s]*$/.test(value)) {
                  setName(value);
  }
}}
              />
            </div>

            <div className="form-group">
              <label>Marks Obtained (%)</label>
              <input
                type="number"
                placeholder="0 - 100"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit">Register Student</button>
          </form>
        </section>

        {/* Right Panel: Display Records */}
        <section className="records-section">
          <div className="section-header-inline">
            <h2>Database Records</h2>
            <input 
              type="text" 
              className="search-input" 
              placeholder="🔍 Search name or roll..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Status Tabs & Export Container Wrapper */}
          <div className="action-row-inline">
            <div className="filter-tabs">
              <button 
                className={`tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({students.length})
              </button>
              <button 
                className={`tab-btn ${statusFilter === 'pass' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pass')}
              >
                Passed ({students.filter(s => Number(s.marks) >= 40).length})
              </button>
              <button 
                className={`tab-btn ${statusFilter === 'fail' ? 'active' : ''}`}
                onClick={() => setStatusFilter('fail')}
              >
                Failed ({students.filter(s => Number(s.marks) < 40).length})
              </button>
            </div>
            
            {totalStudents > 0 && (
              <button onClick={handleExportCSV} className="btn-export">
                📥 Export CSV
              </button>
            )}
          </div>
          
          {filteredStudents.length === 0 ? (
            <div className="no-records">
              <p>{students.length === 0 ? "No student records indexed." : "No matching records found for this filter."}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const gradeInfo = calculateGrade(student.marks);
                    return (
                      <tr key={student.id}>
                        <td><span className="roll-text">{student.rollNo}</span></td>
                        <td>{student.name}</td>
                        <td>
                          <span className={`marks-badge ${Number(student.marks) >= 40 ? 'pass' : 'fail'}`}>
                            {student.marks}%
                          </span>
                        </td>
                        <td>
                          <span className={`grade-badge ${gradeInfo.class}`}>
                            {gradeInfo.label}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      
      <footer className="app-footer">
        <p>Student Management System • Storage & Export System Active</p>
      </footer>
    </div>
  );
}

export default App;
