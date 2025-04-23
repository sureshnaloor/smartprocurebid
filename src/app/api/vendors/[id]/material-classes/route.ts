import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data, error } = await supabase
      .from('vendor_material_classes')
      .select(`
        material_class_id,
        material_classes (
          id,
          name,
          description
        )
      `)
      .eq('vendor_id', params.id);

    if (error) throw error;

    return NextResponse.json(data.map(item => item.material_classes));
  } catch (error) {
    console.error('Error fetching vendor material classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor material classes' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { materialClassIds } = await request.json();

    // First, delete existing material classes
    const { error: deleteError } = await supabase
      .from('vendor_material_classes')
      .delete()
      .eq('vendor_id', params.id);

    if (deleteError) throw deleteError;

    // Then insert new material classes
    const { data, error } = await supabase
      .from('vendor_material_classes')
      .insert(
        materialClassIds.map((id: string) => ({
          vendor_id: params.id,
          material_class_id: id
        }))
      )
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating vendor material classes:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor material classes' },
      { status: 500 }
    );
  }
} 