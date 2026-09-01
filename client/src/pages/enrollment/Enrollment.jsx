import styles from './Enrollment.css';
import { useState } from 'react';

export default function Enrollment() {
    const [step, setStep] = useState(1);
    const [studentType, setStudentType] = useState('');

    const [studentDetails, setStudentDetails] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        age: '',
        gender: '',
        homeAddress: '',
        contact: '',
        email: '',
        birthdate: '',
        mothersName: '',
        mothersContact: '',
        fathersName: '',
        fathersContact: '',
        prevSchool: '',
        guardiansName: '',
        guardiansContact: ''
    });

    const [programTerm, setProgramTerm] = useState({
        term: '',
        year: '',
        track: '',
        program: ''
    });

    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setStudentDetails({ ...studentDetails, [name]: value });
    };

    const handleProgramChange = (e) => {
        const { name, value } = e.target;
        setProgramTerm({ ...programTerm, [name]: value });
    };

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        setStep(3);
    };

    const handleTypeSelect = (type) => {
        setStudentType(type);
        setStep(2);
    };

    const handleProgramSubmit = (e) => {
        e.preventDefault();
        setStep(4);
    };

    const handleBack = (target) => {
        setStep(target);
    };

    const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const enrollmentData = {
        studentDetails,
        studentType,
        programTerm
    };

    try {
        const response = await fetch('http://localhost:5000/api/enrollments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enrollmentData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Enrollment submitted successfully!');
            console.log(data);
        } else {
            alert('Failed to submit enrollment.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Cannot connect to the server.');
    }
};
    const fullName = `${studentDetails.firstName} ${studentDetails.middleName} ${studentDetails.lastName}`.trim();

    return (
        <div className='parent'>
            <div className='cont'>
                <div className='leftTop'>
                    <h6>Course Enrollment</h6>
                    <p>Complete each step below to reserve you place for incoming term.</p>
                </div>
                {step !== 1 && (
                    <div className='rightTop'>
                        <p className={step === 2 ? 'stepActive' : 'stepDone'}>1</p>
                        <div className='load'></div>
                        <p className={step === 3 ? 'stepActive' : step === 4 ? 'stepDone' : ''}>2</p>
                        <div className='load'></div>
                        <p className={step === 4 ? 'stepActive' : ''}>3</p>
                    </div>
                )}
            </div>

            {step === 1 && (
                <div className='first'>
                    <h6>Select student type</h6>
                    <p>Choose which student you are.</p>
                    <div className='typeCards'>
                        <div className='typeCard' onClick={() => handleTypeSelect('college')}>
                            <p>College</p>
                        </div>
                        <div className='typeCard' onClick={() => handleTypeSelect('seniorHigh')}>
                            <p>Senior high school</p>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className='child'>
                    <p className='stepLabel'>Step 1 of 3</p>
                    <h6>Student Details</h6>
                    <p>Provide the details needed.</p>
                    <div className='studentForm'>
                        <form onSubmit={handleDetailsSubmit}>
                            <div className='formRow'>
                                <div className='formGroup'>
                                    <label htmlFor="lastName">Last name:</label>
                                    <input type="text" id="lastName" name="lastName" value={studentDetails.lastName} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="firstName">First name:</label>
                                    <input type="text" id="firstName" name="firstName" value={studentDetails.firstName} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="middleName">Middle name:</label>
                                    <input type="text" id="middleName" name="middleName" value={studentDetails.middleName} onChange={handleDetailsChange} required/>
                                </div>
                            </div>

                            <div className='formRow'>
                                <div className='formGroup small'>
                                    <label htmlFor="age">Age:</label>
                                    <input type="number" id="age" name="age" value={studentDetails.age} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup small'>
                                    <label htmlFor="gender">Gender/Sex:</label>
                                    <input type="text" id="gender" name="gender" value={studentDetails.gender} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="homeAddress">Home address:</label>
                                    <input type="text" id="homeAddress" name="homeAddress" value={studentDetails.homeAddress} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="contact">Contact number:</label>
                                    <input type="text" id="contact" name="contact" value={studentDetails.contact} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="email">Email:</label>
                                    <input type="email" id="email" name="email" value={studentDetails.email} onChange={handleDetailsChange} required/>
                                </div>
                            </div>

                            <div className='formRow'>
                                <div className='formGroup'>
                                    <label htmlFor="birthdate">Birthdate:</label>
                                    <input type="date" id="birthdate" name="birthdate" value={studentDetails.birthdate} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="mothersName">Mother's Maiden Name:</label>
                                    <input type="text" id="mothersName" name="mothersName" value={studentDetails.mothersName} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="mothersContact">Mother's Contact Number:</label>
                                    <input type="text" id="mothersContact" name="mothersContact" value={studentDetails.mothersContact} onChange={handleDetailsChange} required/>
                                </div>
                            </div>

                            <div className='formRow'>
                                <div className='formGroup'>
                                    <label htmlFor="fathersName">Father's Name:</label>
                                    <input type="text" id="fathersName" name="fathersName" value={studentDetails.fathersName} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="fathersContact">Father's Contact Number:</label>
                                    <input type="text" id="fathersContact" name="fathersContact" value={studentDetails.fathersContact} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="prevSchool">Previous School:</label>
                                    <input type="text" id="prevSchool" name="prevSchool" value={studentDetails.prevSchool} onChange={handleDetailsChange} required/>
                                </div>
                            </div>

                            <div className='formRow'>
                                <div className='formGroup'>
                                    <label htmlFor="guardiansName">Guardian's Name:</label>
                                    <input type="text" id="guardiansName" name="guardiansName" value={studentDetails.guardiansName} onChange={handleDetailsChange} required/>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="guardiansContact">Father's Contact Number:</label>
                                    <input type="text" id="guardiansContact" name="guardiansContact" value={studentDetails.guardiansContact} onChange={handleDetailsChange} required/>
                                </div>
                                
                            </div>

                            <div className='divider'></div>

                            <div className='btnRow'>
                                <button type="submit" className='continueBtn'>Continue</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {step === 3 && (
                <div className='child'>
                    <p className='stepLabel'>Step 2 of 3</p>
                    <h6>Program and Term</h6>
                    <p>Please select your program and term.</p>
                    <p className='typeTag'>{studentType === 'college' ? 'College' : 'Senior High School'}</p>
                    <div className='studentForm'>
                        <form onSubmit={handleProgramSubmit}>
                            <div className='formRow'>
                                <div className='formGroup'>
                                    <label htmlFor="term">Term</label>
                                    <select id="term" name="term" value={programTerm.term} onChange={handleProgramChange}>
                                        <option value="">Select Term</option>
                                        <option value="1st Semester">1st Semester</option>
                                        <option value="2nd Semester">2nd Semester</option>
                                        <option value="Summer">Summer</option>
                                    </select>
                                </div>
                                <div className='formGroup'>
                                    <label htmlFor="year">Year</label>
                                    <select id="year" name="year" value={programTerm.year} onChange={handleProgramChange}>
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>
                                {studentType === 'seniorHigh' ? (
                                    <div className='formGroup'>
                                        <label htmlFor="track">Track & Specialization</label>
                                        <select id="track" name="track" value={programTerm.track} onChange={handleProgramChange}>
                                            <option value="">Select Track & Specialization</option>
                                            <option value="STEM">STEM</option>
                                            <option value="ABM">ABM</option>
                                            <option value="HUMSS">HUMSS</option>
                                            <option value="TVL">TVL</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className='formGroup'>
                                        <label htmlFor="program">Program</label>
                                        <select id="program" name="program" value={programTerm.program} onChange={handleProgramChange}>
                                            <option value="">Select Program</option>
                                            <option value="BS Information Technology">BS Information Technology</option>
                                            <option value="BS Computer Science">BS Computer Science</option>
                                            <option value="BS Business Administration">BS Business Administration</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className='divider'></div>

                            <div className='btnRow'>
                                <button type="button" className='backBtn' onClick={() => handleBack(2)}>Back</button>
                                <button type="submit" className='continueBtn'>Continue </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className='child'>
                    <p className='stepLabel'>Step 3 of 3</p>
                    <h6>Review you details</h6>
                    <p>Check your details.</p>
                    <div className='studentForm'>
                        <form onSubmit={handleFinalSubmit}>
                            <div className='reviewGrid'>
                                <div className='reviewLeft'>
                                    <div className='formGroup wide'>
                                        <label>Full name</label>
                                        <input type="text" value={fullName} readOnly />
                                    </div>
                                    <div className='formRow'>
                                        <div className='formGroup small'>
                                            <label>Age</label>
                                            <input type="text" value={studentDetails.age} readOnly />
                                        </div>
                                        <div className='formGroup small'>
                                            <label>Gender</label>
                                            <input type="text" value={studentDetails.gender} readOnly />
                                        </div>
                                        <div className='formGroup small'>
                                            <label>Contact no.</label>
                                            <input type="text" value={studentDetails.contact} readOnly />
                                        </div>
                                    </div>
                                    <div className='formGroup wide'>
                                        <label>Home address</label>
                                        <input type="text" value={studentDetails.homeAddress} readOnly />
                                    </div>
                                    <div className='formGroup wide'>
                                        <label>Email address</label>
                                        <input type="text" value={studentDetails.email} readOnly />
                                    </div>
                                    <div className='formGroup wide'>
                                        <label>Guardian's Name</label>
                                        <input type="text" value={studentDetails.guardiansName} readOnly />
                                    </div>
                                    <div className='formGroup wide'>
                                        <label>Guardian's Contact</label>
                                        <input type="text" value={studentDetails.guardiansName} readOnly />
                                    </div>
                                </div>

                                <div className='reviewDivider'></div>

                                <div className='reviewRight'>
                                    <div className='formGroup'>
                                        <label>Term</label>
                                        <input type="text" value={programTerm.term} readOnly />
                                    </div>
                                    <div className='formGroup'>
                                        <label>Year</label>
                                        <input type="text" value={programTerm.year} readOnly />
                                    </div>
                                    <div className='formGroup'>
                                        <label>{studentType === 'seniorHigh' ? 'Track' : 'Program'}</label>
                                        <input type="text" value={studentType === 'seniorHigh' ? programTerm.track : programTerm.program} readOnly />
                                    </div>
                                </div>
                            </div>

                            <div className='divider' ></div>

                            <div className='btnRow'>
                                <button type="button" className='backBtn' onClick={() => handleBack(3)}>Back</button>
                                <button type="submit" className='continueBtn'>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}