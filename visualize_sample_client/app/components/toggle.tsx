"use client";

import '@/app/styles/toggle.css';

const Toggle: React.FC<{ name: string, setState: React.Dispatch<React.SetStateAction<boolean>> }> = ({ name, setState }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '0 auto 30px'}}>
            <p style={{ margin: '0 10px', fontSize: '18px', position: 'absolute', right: '50%' }}>{name}</p>
            <div className="toggle_button">
                <input
                id="toggle"
                className="toggle_input"
                type='checkbox'
                // checked={lowspeed}
                onChange={(event) => setState(event.target.checked)} />
                <label htmlFor="toggle" className="toggle_label"/>
            </div>
        </div>
    )
}

export default Toggle;