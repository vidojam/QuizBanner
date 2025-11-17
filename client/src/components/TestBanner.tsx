export function TestBanner() {
  return (
    <div 
      style={{
        position: 'fixed',
        top: '50px',
        left: '50px',
        width: '200px',
        height: '100px',
        backgroundColor: 'red',
        zIndex: 9999,
        border: '5px solid black',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold'
      }}
    >
      TEST BANNER
    </div>
  );
}