"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleBookNow = () => {
    router.push("/login");
  };
  return (
    <div style={styles.container}>
      {/* Hero Section with background */}

      {/* Content below the Hero Section */}
      <div style={styles.content}>
        <h1 style={styles.title}>Have a Good Travel with Us !</h1>
        <button style={styles.button} onClick={handleBookNow}>Book Now</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh', 
    display: 'flex',
    flexDirection: 'column', 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    backgroundImage: "url('/back-image.png')", 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '50%', 
    transform: 'translateY(-50%)', 
  },
  title: {
    fontSize: '3rem', 
    marginBottom: '300px', 
  },
  button: {
    padding: '15px 30px',
    fontSize: '1.5rem',
    backgroundColor: 'blue', 
    border: 'none',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '100px', 
  }
};
