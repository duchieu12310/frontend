import React from 'react';

const Section = () => {
    return (
        <div
            className="position-relative text-white text-center"
            style={{
                backgroundImage: 'url("/img/1.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '160px 0 120px',
            }}
        >
            {/* Overlay mờ */}
            <div
                style={{
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                }}
            />
            {/* Text */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                <h1 className="fw-bold display-5 mb-3">
                    Find The Perfect Job That <br /> You Deserved
                </h1>
                <p className="lead mb-4">
                    Vero elitr justo clita lorem. Ipsum dolor at sed stet sit diam no.
                    <br /> Kasd rebum ipsum et diam justo clita et kasd rebum sea elitr.
                </p>
                <div>
                    <button className="btn btn-success btn-lg px-4 me-3 fw-semibold">
                        Search A Job
                    </button>
                    <button className="btn btn-primary btn-lg px-4 fw-semibold">
                        Find A Talent
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Section;
