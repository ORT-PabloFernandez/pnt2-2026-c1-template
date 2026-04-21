async function UserDetailPage({ params }) {
    const {id } = await params;
  return (
    <div>
      <h1>Detalle del usuario {id}</h1>
    </div>
  );
}

export default UserDetailPage;