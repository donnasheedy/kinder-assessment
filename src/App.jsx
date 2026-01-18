import { useState } from 'react';
import LetterSounds from './components/LetterSounds';
import LetterFormation from './components/LetterFormation';
import LetterAnalysis from './components/LetterAnalysis';
import BPSTII from './components/BPSTII';
import SightWords from './components/SightWords';
import PhonicsH from './components/PhonicsH';
import NumberAnalysis from './components/NumberAnalysis';
import NumberFormation from './components/NumberFormation';
import NumberIdentification from './components/NumberIdentification';
import Quantity from './components/Quantity';
import Addition from './components/Addition';
import Subtraction from './components/Subtraction';
import NumberSequence from './components/NumberSequence';
import CompareNumbers from './components/CompareNumbers';
import Shapes from './components/Shapes';
import ShapeFormation from './components/ShapeFormation';
import ShapeAnalysis from './components/ShapeAnalysis';
import './index.css';

// Category and module definitions
const CATEGORIES = {
  reading: {
    name: 'Reading',
    icon: '📚',
    color: '#4A90E2',
    modules: [
      { id: 'sounds', name: 'Letter Sounds', icon: '🔤', desc: 'Identify letter sounds' },
      { id: 'bpst', name: 'BPST II', icon: '📖', desc: '13-part phonics assessment' },
      { id: 'sightwords', name: 'Sight Words', icon: '👁️', desc: 'Level K sight word recognition' },
      { id: 'phonicsh', name: 'Phonics-H', icon: '🔊', desc: 'Phonemic awareness' },
    ]
  },
  writing: {
    name: 'Writing',
    icon: '✏️',
    color: '#7B68EE',
    modules: [
      { id: 'formation', name: 'Letter Formation', icon: '✍️', desc: 'Practice tracing letters' },
      { id: 'analysis', name: 'Letter Analysis', icon: '📊', desc: 'Auto-detect letter quality' },
      { id: 'number-formation', name: 'Number Formation', icon: '✏️', desc: 'Practice tracing numbers (0-20)' },
      { id: 'number-analysis', name: 'Number Analysis', icon: '🔢', desc: 'Auto-detect number quality (0-20)' },
      { id: 'shape-formation', name: 'Shape Formation', icon: '🔶', desc: 'Trace shape silhouettes' },
      { id: 'shape-analysis', name: 'Shape Analysis', icon: '📊', desc: 'Draw shapes freehand' },
    ]
  },
  math: {
    name: 'Math',
    icon: '🔢',
    color: '#50C878',
    modules: [
      { id: 'number-identification', name: 'Number Identification', icon: '🔢', desc: 'Identify numbers 0-20' },
      { id: 'number-sequence', name: 'Number Sequence', icon: '🔣', desc: 'Part 1: 1 number, Part 2: 2, Part 3: 3' },
      { id: 'quantity', name: 'Quantity', icon: '🎯', desc: 'Count items (0-20)' },
      { id: 'addition-single', name: 'Addition (Single Digit)', icon: '➕', desc: 'Part 1: 0-5, Part 2: 0-9' },
      { id: 'addition-double', name: 'Addition (Double Digit)', icon: '➕', desc: 'Part 1: 10-20, Part 2: 10-90' },
      { id: 'subtraction-single', name: 'Subtraction (Single Digit)', icon: '➖', desc: 'Part 1: 0-5, Part 2: 0-9' },
      { id: 'subtraction-double', name: 'Subtraction (Double Digit)', icon: '➖', desc: 'Part 1: 10-20, Part 2: 10-90' },
      { id: 'compare-numbers', name: 'Compare Numbers', icon: '↔️', desc: '12 problems: numerals & quantities' },
      { id: 'shapes', name: 'Shapes', icon: '🔶', desc: 'Part 1: 2D, Part 2: 3D, Part 3: Compare' },
    ]
  },
  science: {
    name: 'Science',
    icon: '🔬',
    color: '#FF6B6B',
    modules: [
      { id: 'plants', name: 'How Plants Grow', icon: '🌱', desc: 'Plant life cycle', disabled: true },
    ]
  }
};

function App() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  // Handle back navigation
  const handleBack = () => {
    if (activeModule) {
      setActiveModule(null);
    } else {
      setActiveCategory(null);
    }
  };

  // Category selection screen
  if (!activeCategory) {
    return (
      <div className="app">
        <div className="category-selection">
          <h1 className="app-title">KinderAssess</h1>
          <p className="app-subtitle">Choose a subject area</p>

          <div className="category-grid">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <div
                key={key}
                className="category-card"
                style={{ '--category-color': cat.color }}
                onClick={() => setActiveCategory(key)}
              >
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">
                  {cat.modules.filter(m => !m.disabled).length} assessments
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Module selection screen (within a category)
  if (!activeModule) {
    const category = CATEGORIES[activeCategory];
    return (
      <div className="app">
        <div className="module-selection">
          <div className="module-header">
            <button className="back-btn" onClick={handleBack}>
              ← Back
            </button>
            <h2 style={{ color: category.color }}>
              {category.icon} {category.name}
            </h2>
          </div>

          <div className="module-grid">
            {category.modules.map((mod) => (
              <div
                key={mod.id}
                className={`module-card ${mod.disabled ? 'disabled' : ''}`}
                onClick={() => !mod.disabled && setActiveModule(mod.id)}
              >
                <div className="module-icon">{mod.icon}</div>
                <div className="module-title">{mod.name}</div>
                <div className="module-desc">
                  {mod.disabled ? 'Coming soon' : mod.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active module view
  return (
    <div className="app">
      <nav className="app-nav">
        <button className="nav-btn" onClick={handleBack}>
          ← Back to {CATEGORIES[activeCategory].name}
        </button>
      </nav>

      {activeModule === 'sounds' && <LetterSounds />}
      {activeModule === 'formation' && <LetterFormation />}
      {activeModule === 'analysis' && <LetterAnalysis />}
      {activeModule === 'bpst' && <BPSTII />}
      {activeModule === 'sightwords' && <SightWords />}
      {activeModule === 'phonicsh' && <PhonicsH />}
      {activeModule === 'number-analysis' && <NumberAnalysis />}
      {activeModule === 'number-formation' && <NumberFormation />}
      {activeModule === 'number-identification' && <NumberIdentification />}
      {activeModule === 'quantity' && <Quantity />}
      {activeModule === 'addition-single' && <Addition type="single" />}
      {activeModule === 'addition-double' && <Addition type="double" />}
      {activeModule === 'subtraction-single' && <Subtraction type="single" />}
      {activeModule === 'subtraction-double' && <Subtraction type="double" />}
      {activeModule === 'number-sequence' && <NumberSequence />}
      {activeModule === 'compare-numbers' && <CompareNumbers />}
      {activeModule === 'shapes' && <Shapes />}
      {activeModule === 'shape-formation' && <ShapeFormation />}
      {activeModule === 'shape-analysis' && <ShapeAnalysis />}
    </div>
  );
}

export default App;
