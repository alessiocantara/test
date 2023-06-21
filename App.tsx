import React, { useEffect, useState, ReactNode } from 'react';
import './App.css';


type Entry = {
  kind: string;
  code: string;
  organism_id?: string;
};

interface MyData {
  root: Entry[];
};

interface Annotation {
  method: string;
  id: string;
  title?: string;
}

async function fetchAdditionalData(kind: string, code: string) {
  if (kind === 'go') {
    const response = await fetch(`http://localhost:8000/go-terms/${code}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } else if (kind === 'eco') {
    const response = await fetch(`http://localhost:8000/eco-terms/${code}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } else if (kind === 'uniprot') {
    const response = await fetch(`http://localhost:8000/uniprot/${code}`, {
      headers: {
        Accept: 'text/plain; format=tsv',
      },
    });
    const data = await response.text();
    return data;
  } else if (kind === 'pubmed') {
    const response = await fetch(`http://localhost:8000/articles/${code}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } else if (kind === 'pdb') {
    const response = await fetch(`http://localhost:8000/pdb/${code}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    const data = await response.json();
    return data;
  } else if (kind === 'uniprot_single') {
    const response = await fetch(`http://localhost:8000/uniprot_single_entry/${code}`, {
      headers: {
        Accept: 'application/json'
      },
    });
    const data = await response.json();
    return data;
  } else if (kind === 'emdb_annotation') {
    const response = await fetch(`http://localhost:8000/emdb_annotation/${code}`, {
      headers: {
        Accept: 'application/json'
      },
    });
    const data = await response.json()
    return data;
  }
}

function DataTree() {
  const [state, setState] = useState<MyData | undefined>();
  const [detail, setDetail] = useState<any>(null);
  const [selectedPDB, setSelectedPDB] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/data')
      .then((r) => r.json())
      .then(setState);
  }, []);

  if (!state) return <div>Loading...</div>;

  const handleCodeChange = (index: number, code: string) => {
    setState((prevState: MyData | undefined) => {
      if (prevState) {
        const updatedRoot = [...prevState.root];
        updatedRoot[index] = {
          ...updatedRoot[index],
          code: code,
        };
        return {
          root: updatedRoot,
        };
      }
      return prevState;
    });
  };

  const handleFetchData = async (index: number) => {    
    if (state && state.root[index]) {
      const { kind, code } = state.root[index];
      const data = await fetchAdditionalData(kind, code);
      setDetail(data);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      handleFetchData(index);
    }
  };  
  return (
    <div>
      {state.root.map((entry, index) => (
        <div key={index}>
          {entry.kind}:{' '}
          <input
            type="text"
            placeholder="Code without Prefix"
            value={entry.code}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
          <button onClick={() => handleFetchData(index)}>Fetch Data</button>
        </div>
      ))}
      <h5>Detail</h5>
      <div style={{ whiteSpace: 'pre' }}>{JSON.stringify(detail, undefined, 2)}</div>
      {detail && detail.annotations && (
        <div>
          <h5>Annotations</h5>
          <ul>    
            {/* PDB and UNIPROT are valid for EMDB JSON */}                    
            {detail.annotations.PDB && (
              <li>                
                PDB:
                {detail.annotations.PDB.map((annotation: any) => ( 
                  <button key={annotation.id} onClick={() => setSelectedPDB(annotation.id)} className={selectedPDB === annotation.id ? "selected" : ""}>
                    {annotation.id}
                  </button>
                ))}
              </li>
            )}
            {detail.macromolecules && detail.macromolecules.m4 && detail.macromolecules.m4.annotations && detail.macromolecules.m4.annotations.UNIPROT && (
              <li>
                UNIPROT:
                {detail.macromolecules.m4.annotations.UNIPROT.map((annotation: any) => (
                  <button key={annotation.id} onClick={() => console.log(annotation.id)}>
                    {annotation.id}
                  </button>
                ))}
              </li>
            )}
            {/* For PDB JSON there are EMDB IDs,  */}
      {detail.entry_info && (
        <div>
          <h5>Annotations</h5>
          <ul>
            {detail.entry_info.id && (
              <li>
                EMDB:
                {detail.entry_info.id.map((annotation: any) => (
                  <button key={annotation.id} onClick={() => console.log(annotation.id)}>
                    {annotation.id}
                  </button>
                ))}
              </li>
            )}
          </ul>
        </div>
      )}                               
          </ul>
        </div>
      )}
    </div>
  );
  
                  }  

function App() {
  return (
    <div className="App">
      <DataTree />
    </div>
  );
}

export default App;
